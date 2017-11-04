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
    tinymce.create('tinymce.plugins.CK12PageBreakPlugin', {
        init : function(ed, url) {
            var pb = '<hr class="x-ck12-pagebreak" />', cls = 'x-ck12-pagebreak', sep = ed.getParam('pagebreak_separator', '<!-- pagebreak -->'), pbRE;

            pbRE = new RegExp(sep.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function(a) {return '\\' + a;}), 'g');

            // Register commands
            ed.addCommand('x-ck12-pagebreak', function() {
                ed.execCommand('mceInsertContent', 0, pb);
            });

            // Register buttons
            ed.addButton('pagebreak', {title : 'Pagebreak', cmd : cls});

            ed.on('init', function() {

                ed.on('ResolveName', function(o) {
                    if (o.target.nodeName == 'HR' && ed.dom.hasClass(o.target, cls)) {
                        o.name = 'pagebreak';
                    }
                });

            });

            ed.on('click', function(e) {
                var n = e.target;

                if (n.nodeName === 'HR' && ed.dom.hasClass(e, cls)) {
                    ed.selection.select(n);
                }
            });

            ed.on('nodechange', function(e) {
                if (e && e.parents && e.parents.length > 0) {
                  for (var i = 0; i < e.parents.length; i++) {
                      var arrElm = e.parents[i];
                       if (arrElm && arrElm.tagName && ('BR' == arrElm.tagName.toUpperCase() || 'P' == arrElm.tagName.toUpperCase() )) {
                            ed.fire('enable', { button: 'pagebreak' });
                        } else {
                            ed.fire('disable', { button: 'pagebreak' });
                        }
                    }
                }
                if(e.element.nodeName === 'HR' && ed.dom.hasClass(e.element, cls)){
                    ed.fire('active', { button: 'pagebreak' });
                    ed.fire('enable', { button: 'pagebreak' });
                }else{
                    ed.fire('inactive', { button: 'pagebreak' });
                }
            });

            ed.on('BeforeSetContent', function(e) {
                e.content = e.content.replace(pbRE, pb);
            });

            ed.on('postprocess', function(o) {
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
    tinymce.PluginManager.add('ck12pagebreak', tinymce.plugins.CK12PageBreakPlugin);
})();