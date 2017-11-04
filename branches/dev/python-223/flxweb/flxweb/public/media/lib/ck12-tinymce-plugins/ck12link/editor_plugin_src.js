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
 * This file originally written by Chetan Padhye
 *
 * $Id$
 */
(function () {

    'use strict';

    tinymce.create('tinymce.plugins.CK12LinkPlugin', {
        init: function (ed, url) {
            this.editor = ed;
            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12link';
            }

            // Register commands
            ed.addCommand('mceAdvLink', function () {

                var se = ed.selection;

                // No selection and not in link
                if (se.isCollapsed() && !ed.dom.getParent(se.getNode(), 'A')) {
                    return;
                }

                ed.storeSelection = ed.selection.getBookmark();
                ed.windowManager.open({
                    file: url + '/link.htm',
                    width: 310 + parseInt(ed.getLang('advlink.link_delta_width', 0), 10),
                    height: 200 + parseInt(ed.getLang('advlink.link_delta_height', 0), 10),
                    inline: true

                }, {
                    plugin_url: url
                });
            });

            // Register buttons
            ed.addButton('link', {
                title: 'advlink.link_desc',
                cmd: 'mceAdvLink'
            });

            ed.addShortcut('ctrl+k', 'advlink.advlink_desc', 'mceAdvLink');


            ed.onNodeChange.add(function (ed, cm, n, co) {
                cm.setDisabled('link', co && n.nodeName !== 'A');
                cm.setActive('link', n.nodeName === 'A' && !n.name);
            });

        },

        getInfo: function () {
            return {
                longname: 'CK-12 Link Plugin ',
                author: 'Chetan Padhye',
                authorurl: 'http://www.ck12.org',
                infourl: 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version: "1.0"
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12link', tinymce.plugins.CK12LinkPlugin);
}());