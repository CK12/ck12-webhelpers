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
 */ (function () {

    tinymce.create('tinymce.plugins.CK12definitionlistPlugin', {

        init: function (ed, url) {

            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12definitionlist';
            }

            ed.addCommand('definitionlist', function () {
               
                var definitionlisthtml = "";
                tinymce.each(ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()), function (element) {
                    if ('DL' == element.tagName.toUpperCase() || 'DT' == element.tagName.toUpperCase() || 'DD' == element.tagName.toUpperCase()) {
                        definitionlisthtml =  " <dt> Term </dt> <dd> Definition </dd> ";      
                    }else {
                        definitionlisthtml =  " <dl> <dt> Term </dt> <dd> Definition </dd> </dl> ";
                    }
                });
                tinyMCE.execCommand('mceInsertContent', false, definitionlisthtml);
                
            });


            ed.addButton('ck12definitionlist', {
                'title': 'Insert Definition List',
                'cmd': 'definitionlist',
                'image': url + '/img/definitionlist.gif'
            });

        },

        getInfo: function () {
            return {
                longname: 'CK-12 definitionlist ',
                author: 'Chetan Padhye',
                authorurl: 'http://www.ck12.org',
                infourl: 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version: "1.0"
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12definitionlist', tinymce.plugins.CK12definitionlistPlugin);
})();