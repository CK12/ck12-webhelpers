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
    tinymce.create('tinymce.plugins.PageBreakPlugin', {
        init : function(ed, url) {
            var pb = '<hr class="x-ck12-pagebreak" />', cls = 'x-ck12-pagebreak', sep = ed.getParam('pagebreak_separator', '<!-- pagebreak -->'), pbRE;

            pbRE = new RegExp(sep.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function(a) {return '\\' + a;}), 'g');

            // Register commands
            ed.addCommand('x-ck12-pagebreak', function() {
                ed.execCommand('mceInsertContent', 0, pb);
            });

            // Register buttons
            ed.addButton('pagebreak', {title : 'pagebreak.desc', cmd : cls});

            ed.onInit.add(function() {
                if (ed.theme.onResolveName) {
                    ed.theme.onResolveName.add(function(th, o) {
                        if (o.node.nodeName == 'HR' && ed.dom.hasClass(o.node, cls))
                            o.name = 'pagebreak';
                    });
                }
            });

            ed.onClick.add(function(ed, e) {
                e = e.target;

                if (e.nodeName === 'HR' && ed.dom.hasClass(e, cls))
                    ed.selection.select(e);
            });

            ed.onNodeChange.add(function(ed, cm, n) {
                if (ed && ed.parents && ed.parents.length > 0) {
                  for (var i = 0; i < ed.parents.length; i++) {
                      var arrElm = ed.parents[i];
                       if ('BR' == arrElm.tagName.toUpperCase() || 'P' == arrElm.tagName.toUpperCase()) {
                              cm.setDisabled('pagebreak', false);
                        } else {
                              cm.setDisabled('pagebreak', true);
                        }
                    }
                } 
                if(n.nodeName === 'HR' && ed.dom.hasClass(n, cls)){                   
                    cm.setActive('pagebreak', true);
                    cm.setDisabled('pagebreak', false);
                }else{
                    cm.setActive('pagebreak', false);   
                }                  
            });

            ed.onBeforeSetContent.add(function(ed, o) {
                o.content = o.content.replace(pbRE, pb);
            });

            ed.onPostProcess.add(function(ed, o) {
                if (o.get)
                    o.content = o.content.replace(/<img[^>]+>/g, function(im) {
                        if (im.indexOf('class="x-ck12-pagebreak') !== -1)
                            im = sep;

                        return im;
                    });
            });
        },

        getInfo : function() {
            return {
                longname : 'PageBreak',
                author : 'Moxiecode Systems AB',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/pagebreak',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('pagebreak', tinymce.plugins.PageBreakPlugin);
})();