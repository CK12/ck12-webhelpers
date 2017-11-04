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
 * $Id$
 */
(function () {
    tinymce.create('tinymce.plugins.MathImagePlugin', {
        init: function (ed, url) {
            // Register commands
            ed.addCommand('mceMathImage', function () {
                var e = ed.selection.getNode();
                // Internal image and non math image
                if (e.nodeName == 'IMG' && ((ed.dom.getAttrib(e, 'class').indexOf('mceItem') != -1) || 
                  ((ed.dom.getAttrib(e, 'class').indexOf('x-ck12-block-math') == -1) && (ed.dom.getAttrib(e, 'class').indexOf('x-ck12-math') == -1)))) 
                   return;

                ed.windowManager.open({
                    file: url + '/symboleditor.htm',
                    width: 800 + parseInt(ed.getLang('advimage.delta_width', 0)),
                    height: 550 + parseInt(ed.getLang('advimage.delta_height', 0)),
                    inline: 1
                }, {
                    plugin_url: url
                });
            });

            // Register buttons
            ed.addButton('mathimage', {
                title: 'Insert / Edit Math Equation',
                cmd: 'mceMathImage',
                image: url + '/img/icon_math.gif'
            });

            ed.onNodeChange.add(function (ed, cm, n) {
                cm.setActive('mathimage', n.nodeName == 'IMG' && isMathImage(n));
            });

            function isMathImage(n) {
                return /^(x-ck12-block-math|x-ck12-math)$/.test(n.className);
            }

            ed.onInit.add(function () {
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function (th, m, e) {
                        var sm, se = ed.selection,
                            el = se.getNode() || ed.getBody();
                        var div = ed.dom.getParent(e, 'div');

                        if (isMathImage(el)) {
                            m.removeAll();
                            m.add({
                                title: 'Edit equation',
                                icon: 'image',
                                cmd: 'mceMathImage',
                                ui: true
                            });
                        }
                    });
                }
            });

        },

        getInfo: function () {
            return {
                longname: 'Math Expression Image',
                author: 'Moxiecode Systems AB',
                authorurl: 'http://tinymce.moxiecode.com',
                infourl: 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/mathimage',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('mathimage', tinymce.plugins.MathImagePlugin);
})();
