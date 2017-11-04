/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
    // Load plugin specific language pack
    tinymce.PluginManager.requireLangPack('ck12embed');

    //private variables for plugin
    var plugin_url = '';
    var EMBED_IFRAME_ATTRIBUTES = 'id|name|title|longdesc|class|width|height|src|frameborder';
    var EMBED_CONTAINER_ATTRIBUTES = 'itemprop|itemscope|itemtype';
    var EMBED_META_ITEMPROP_NAMES = 'description|image|name|url';
    var EMBED_PLACEHOLDER_CLASS = 'ck12-media-placeholder';
    var EMBED_PLACEHOLDER_SRC = '/images/trans.gif';

    tinymce.create('tinymce.plugins.CK12EmbedPlugin', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
            var self = this;
            this.editor = ed;
            if(ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12embed';
            }
            plugin_url= self.plugin_url = url;

            ed.onPreInit.add(function() {
                // Convert video elements to image placeholder
                var imgnode = null;
                var node = null;
                ed.parser.addNodeFilter('iframe', function(nodes) {
                    var i = nodes.length;
                    while(i--){
                        node = nodes[i];
                        imgnode = self.embedNodeToImg(node);
                        node.parent.replace(imgnode);
                    }
                });
                // Convert image placeholders to video elements
                ed.serializer.addNodeFilter('img', function(nodes, name, args) {
                    var i = nodes.length, node;
                    while(i--) {
                        node = nodes[i];
                        var nodeclass = node.attr('class')  || '';
                        if(nodeclass.indexOf('ck12-media-placeholder') !== -1 ){
                            self.imgToEmbed(node, args);
                        }
                    }
                });
            });
            // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
            ed.addCommand('mceEmbedDialog', function() {
                ed.windowManager.open({
                    file : plugin_url + '/embed.htm',
                    width : 420,
                    height : 500,
                    inline : 1
                }, {
                    plugin_url : plugin_url // Plugin absolute URL
                });
            });
            ed.addCommand('mceEmbedDelete',function(){
                var el = ed.selection.getNode();
                if (el && el.className && el.className.indexOf(EMBED_PLACEHOLDER_CLASS) != -1){
                    el.parentNode.removeChild(el);
                }
            });
            // Register example button
            ed.addButton('ck12embed', {
                'title' : 'ck12embed.desc',
                'cmd' : 'mceEmbedDialog',
                'class' : 'mce_media'
            });

            // Add a node change handler, selects the button in the UI when a image is selected
            ed.onNodeChange.add(function(ed, cm, n) {
                if (n.nodeName == 'IMG'){
                    if (n.className && n.className.indexOf(EMBED_PLACEHOLDER_CLASS) != -1 ){
                        cm.setActive('ck12embed',true);
                        cm.setDisabled('image',true);
                    } else {
                        cm.setActive('ck12embed',false);
                        cm.setDisabled('image',false);
                    }
                } else {
                    cm.setActive('ck12embed',false);
                    cm.setDisabled('image',false);
                }
            });
            
            //add context menu
            ed.onInit.add(function() {
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
                        var sm, se = ed.selection, el = se.getNode() || ed.getBody();
                        var div = ed.dom.getParent(e, 'div');

                        if ( el.nodeName == "IMG" && ed.dom.getAttrib(e, 'class').indexOf(EMBED_PLACEHOLDER_CLASS) != -1 ) {
                            m.removeAll();
                            m.add({title : 'Edit Embedded Object', icon : 'media', cmd : 'mceEmbedDialog', ui : true});
                            m.add({title : 'Delete Embedded Object',
                             icon : 'ck12EmbedDelete', 
                             cmd : 'mceEmbedDelete', ui : true});
                            m.addSeparator();
                        }
                    });
                }
            });
        },
        /**
         * Creates control instances based in the incomming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} n Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl : function(n, cm) {
            return null;
        },
        _in_array : function(_arr, val){
            var i, o;
            for (i = 0; i < _arr.length; i++){
                o = _arr[i];
                if ( o == val ){
                    return true;
                }
            }
            return false;
        },
        embedNodeToJSON: function(node){
            var self = this;
            if (node){
                
                var container_attributes = EMBED_CONTAINER_ATTRIBUTES.split('|');
                var iframe_attributes = EMBED_IFRAME_ATTRIBUTES.split('|');
                var meta_attribute_names = EMBED_META_ITEMPROP_NAMES.split('|');
                
                var propset = {};
                var i, a;
                
                i = node.attributes.length;
                while (i--){
                    a = node.attributes[i];
                    if ( self._in_array(iframe_attributes, a.name) ){
                        propset['data-ck12embed-iframe-'+a.name] = a.value;
                    }
                }
                
                var container = node.parent;
                if (container){
                    if (container.name == 'div'){
                        i = container.attributes.length;
                        while (i--){
                            a = container.attributes[i];
                            if ( self._in_array(container_attributes,a.name) ){
                                propset['data-ck12embed-container-'+a.name] = a.value;
                            }
                        }
                    }
                    var meta_nodes = container.getAll('meta');
                    if (meta_nodes && meta_nodes.length){
                        i = meta_nodes.length;
                        while(i--){
                            a = meta_nodes[i];
                            var prop = a.attr('itemprop');
                            var val = a.attr('content');
                            if ( self._in_array(meta_attribute_names,prop) ){
                                propset['data-ck12embed-meta-'+prop] = val;
                            }
                        }
                    }
                }
                return propset;
            }
        },
        embedNodeToImg : function(node){
            var self = this;
            if (node){
                var jsondata = self.embedNodeToJSON(node);
                var img = tinymce.html.Node.create('img', jsondata);
                img.attr('src', plugin_url + EMBED_PLACEHOLDER_SRC);
                img.attr('class', EMBED_PLACEHOLDER_CLASS);
                if (jsondata['data-ck12embed-iframe-width']){
                    img.attr('width',jsondata['data-ck12embed-iframe-width']);
                }
                if (jsondata['data-ck12embed-iframe-height']){
                    img.attr('height',jsondata['data-ck12embed-iframe-height']);
                }
                return img;
            }
            
        },
        htmlstrToImg : function(htmlstr){
            var fragment = null;
            var container = null;
            var img = null;
            if (htmlstr){
                fragment = this.editor.parser.parse(htmlstr);
                if (fragment){
                    img = fragment.getAll('img')[0];
                }
            }
            return img;
        },
        imgToEmbed : function(node, args){
            if (node){
                
                var attributes = {
                    'container':{},
                    'iframe':{},
                    'meta':{}
                };
                var _attr, i, _name;
                i = node.attributes.length;
                while (i--){
                    _attr = node.attributes[i];
                    _name = _attr.name.replace('data-ck12embed-','').split('-');
                    if (attributes[ _name[0] ]){
                        attributes[ _name[0] ][ _name[1] ] = _attr.value;
                    }
                }
                
                var container = tinymce.html.Node.create('div', attributes['container']);
                if (!container.attr('itemscope')){
                    container.attr('itemscope','');
                }
                if (attributes.meta){
                    var metaNode = null;
                    for ( _name in attributes.meta){
                        if (attributes.meta.hasOwnProperty(_name)){
                            _attr = attributes.meta[_name];
                            metaNode = this.editor.parser.parse('<meta />').getAll('meta')[0];
                            metaNode.attr('itemprop',_name);
                            metaNode.attr('content',_attr);
                            container.append(metaNode);
                        }
                    }
                }
                if ( attributes.iframe &&  !('frameborder' in attributes.iframe) ){
                    attributes.iframe.frameborder = "0";
                }
                var ifr = tinymce.html.Node.create('iframe', attributes['iframe']);
                container.append(ifr);
                node.replace(container);
            }
        },
        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'CK-12 Embedded Objects',
                author : 'Nachiket Karve',
                authorurl : 'http://www.ck12.org',
                infourl : 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version : "1.0"
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12embed', tinymce.plugins.CK12EmbedPlugin);
})();