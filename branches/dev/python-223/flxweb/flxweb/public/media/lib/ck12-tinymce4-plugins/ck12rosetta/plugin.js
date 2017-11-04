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

/* globals tinymce:true, $:true */
(function() {
    'use strict';
    // Load plugin specific language pack
    //tinymce.PluginManager.requireLangPack('example');

    //private variables
    var plugin_url = '';

    //Initialize  the plugin
    tinymce.create('tinymce.plugins.CK12Rosetta', {
        init : function(ed, url) {
            plugin_url = url;
            var headerStyleButtons = [
                    'bold',
                    'ck12highlight',
                    'ck12textcolor',
                    'italic',
                    'link',
                    'strikethrough',
                    'subscript',
                    'superscript',
                    'underline'
                ],
                headerStyles = {
                    buttons: headerStyleButtons
                },
                inlineImageClass = ed.getParam('image_class_inline');


            function toggleFormat(name, value) {
                var currentNode = ed.selection.getNode(),
                    parentBlockquote = currentNode && ed.dom.getParent(currentNode, 'blockquote'),
                    dom = ed.dom,
                    blockquote, $temp;

                if (currentNode && currentNode.tagName === 'LI'){
                    if (parentBlockquote) {
                        dom.replace(currentNode.parentNode, parentBlockquote);
                    } else {
                        blockquote = dom.create('blockquote');
                        $temp = $(currentNode.parentNode).wrap('<span id="mce_marker"></span>').parent();
                        dom.replace(blockquote, $temp[0], true);
                    }
                    ed.focus();
                    ed.selection.select(currentNode, true);
                    ed.selection.collapse(false);
                } else {
                    ed.formatter.toggle(name, value ? {value: value} : undefined);
                }
                ed.nodeChanged();

                return !!parentBlockquote;
            }

            ed.addCommand('mceBlockQuote', function(){
                var addBlockQuote = toggleFormat('blockquote');
                // Enforce styleselect to be disabled when creating a blockquote
                if(addBlockQuote){ ed.fire('disable', { button: 'styleselect' }); }
            });

            function isImage(node){
                return (ed.events.ck12image.isImage(node) || ed.events.ck12image.isInlineImage(node));
            }

           // Bug 10647 : Add a node change handler, selects the button in the UI when a Header is selected.
            ed.on('nodechange', function (e) {
                var ed = this,
                    n = e.element,
                    disableHeaderStyling = false,
                    _isImage = isImage(n);

                if (n.nodeName === 'H3' || n.nodeName === 'H4' || n.nodeName === 'H5' || n.nodeName === 'H6' || n.nodeName === 'H2' || n.nodeName === 'H1') {
                    disableHeaderStyling = true;
                }

                if (_isImage || disableHeaderStyling) {
                    ed.fire('disable', headerStyles);
                } else {
                    ed.fire('enable', headerStyles);
                }

                // Bug 10836 allow only 'paragraph' format for blockquotes.
                ed.fire('enable', { buttons: ['styleselect', 'blockquote'] });

                // if parent node is BLOCKQUOTE disable format.
                if ( (n && n.parentNode && n.parentNode.nodeName === 'BLOCKQUOTE') || _isImage) {
                    ed.fire('disable', { button: 'styleselect' });
                } else {
                    ed.fire('enable', { button: 'styleselect' });
                }

                // if selection has BLOCKQUOTE parent disable format.
                if (ed && ed.parents && ed.parents.length > 0) {
                    // Loop over parents array as there could be other elements than 'TD'
                    for (var i = 0; (i < ed.parents.length); i++) {
                        var arrElm = ed.parents[i];
                        if ('BLOCKQUOTE' === arrElm.tagName.toUpperCase()) {
                            ed.fire('disable', { button: 'styleselect' });
                        }
                    }
                }

                // if text has already format, disable BLOCKQUOTE
                if (disableHeaderStyling || (n && n.nodeName === 'PRE')) {
                    ed.fire('disable', { button: 'blockquote' });
                }
            });

            // Bug 7931 : wrap ck12-media-placeholder with P if it is not in paragraph before save operation.
            ed.on('preprocess', function(e) {
                var nodes, node,
                    ed = this,
                    dom = ed.dom,
                    i;

                nodes = dom.select('.ck12-media-placeholder');
                i = nodes.length;
                while (i--) {
                    node = nodes[i];
                    if (null !== node.parentNode && node.parentNode.nodeName !== 'P') {
                        $(node).wrap('<P/>');
                    }
                }

                 //Bug 8889  bogus element is removed while getting xhtml content from tinymce
                // if it has data it is placed in new P element and bogus br is removed.
                nodes = dom.select('.x-ck12-editor-clearbottom');
                i = nodes.length;
                while (i--) {
                    node = nodes[i];
                    if($(node).children().length !== 0 || $.trim($(node).text()).length > 0){
                        var innerData = node.innerHTML;
                        $(node).replaceWith('<p>' + innerData + '</p>');
                    } else {
                        dom.remove($(node));
                    }
                }

                nodes = dom.select('img');
                i = nodes.length;
                while (i--) {
                    var node = nodes[i];
                    //look for data-flx-url for images pasted from details pages.
                    var flxurl = $(node).attr('data-flx-url');
                    if (typeof flxurl !== 'undefined' || typeof flxurl !== 'string'){
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

                        if (typeof src !== 'string'){
                            src = node.attributes['src'] ? node.attributes['src'].nodeValue : '';
                        }
                        var index = src.indexOf('/flx/');
                        if (index !== -1 && index !== 0) {
                            src = src.substring(index);
                            $(node).attr('src', src);
                            $(node).attr('data-mce-src', src);
                        }
                    }
                    $(node).removeAttr('data-flx-url');
                }
            });

            // Bug 43315 -
            // Remove span classes with an inline image class
            // after hitting enter on an inline image
            ed.on('change', function(){
                var nodes = ed.dom.select('span.' + inlineImageClass),
                    i = nodes.length,
                    childArray;

                while (i--){
                    // Without any children, assume element is just a span
                    if(nodes[i].children.length === 0){ return ed.dom.removeClass(nodes[i], inlineImageClass); }

                    // Get all nodes contained within span
                    childArray = [].filter.call(nodes[i].childNodes, function(child){
                        return child.nodeName !== 'IMG' && child.nodeName !== '#comment';
                    });

                    // Remove class inline image class and then add after span
                    childArray.forEach(function(child){
                        ed.dom.removeClass(child, inlineImageClass);
                        ed.dom.insertAfter(child, nodes[i]);
                    });
                }
            });

            // Bug 8709 on undo/redo, active context menu is closed.
            ed.on('undo', function() {
                ed.fire('contextmenu:hide');
            });

            ed.on('redo', function() {
                ed.fire('contextmenu:hide');
            });

            ed.on('init', function() {
                //Add formats
                ed.formatter.register('underline', {
                    inline : 'span',
                    classes : 'x-ck12-underline'
                });
                ed.formatter.register('strikethrough', {
                    inline : 'span',
                    classes : 'x-ck12-strikethrough'
                });

                //Bug 8889 adding a bogus br with style="clear:both" at the bottom.
                //ed.dom.add(ed.getBody(),ed.dom.create('br', {'class': "x-ck12-editor-clearbottom"}));
            });

            ed.on('preinit', function() {

                //Before add content to tinymce
                // Remove rosetta classes in ol list and add its css style as inline style. so that tinymce can handle it.
                ed.parser.addNodeFilter('ol', function(nodes) {
                    var i = nodes.length,
                        node;
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

                        if(nodeclass.indexOf('x-ck12-') === -1) {
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


            // Returns a function, that, as long as it continues to be invoked, will not
            // be triggered. The function will be called after it stops being called for
            // N milliseconds. If `immediate` is passed, trigger the function on the
            // leading edge, instead of the trailing.
            function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) { func.apply(context, args); }
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) { func.apply(context, args); }
                };
            }

            var nodeChange = debounce(function(){
                ed.nodeChanged();
            }, 500);

            // After initially typing on a new modality the mouse caret is not considered part
            // of the element on which you have just finished typing. This resolves the issue.
            //
            // Load content is added in order to update the context menu internally
            //
            // Debounced to not fire off mass amounts of node changes.
            ed.on('loadcontent keyup mouseup', nodeChange);

            ed.on('focus:window', function(){
                var $popup = tinymce.activeEditor.windowManager.windows[0].$el,
                    $inputs = $popup.find('input, textarea'),
                    $iframe,
                    $iframeDoc;

                if($inputs.length > 0){
                    $inputs.first().on('load', function(){
                        this.focus();
                    });
                    return;
                }

                $iframe = $popup.find('iframe');
                if($iframe.length > 0){
                    $iframe.on('load', function(){
                        $iframeDoc = $( $iframe[0].contentWindow.document );
                        $inputs = $iframeDoc.find('input, textarea');
                        if($inputs.length > 0) { $inputs.first().focus(); }
                    });
                }
            });

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
                version : '1.0'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12rosetta', tinymce.plugins.CK12Rosetta);
})();
