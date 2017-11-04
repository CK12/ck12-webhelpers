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

/* globals tinymce:true, tinyMCE:true */

(function () {
    'use strict';

    tinymce.create('tinymce.plugins.CK12definitionlistPlugin', {

        init: function (ed, url) {

            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12definitionlist';
            }

            ed.addCommand('definitionlist', function () {

                var definitionlisthtml = '';
                tinymce.each(ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()), function (element) {
                    var tagName = element.tagName.toUpperCase();
                    if ('DL' === tagName || 'DT' === tagName || 'DD' === tagName) {
                        definitionlisthtml =  ' <dt> Term </dt> <dd> Definition </dd> ';
                    }else {
                        definitionlisthtml =  ' <dl> <dt> Term </dt> <dd> Definition </dd> </dl> ';
                    }
                });
                tinyMCE.execCommand('mceInsertContent', false, definitionlisthtml);

            });


            ed.addButton('ck12definitionlist', {
                'title': 'Insert Definition List',
                'cmd': 'definitionlist',
                'image': url + '/img/definitionlist.gif'
            });

            ed.addCommand('ck12DefinitionItem', function () {
                handleDefinitionElements('DT');
            });

            ed.addCommand('ck12DefinitionDescription', function () {
                handleDefinitionElements('DD');
            });

            function handleDefinitionElements(type){
                var nodes     = ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()),
                    otherType = type === 'DT' ? 'DD' : 'DT',
                    command   = type === 'DT' ? 'Outdent' : 'Indent';

                ed.undoManager.transact(function(){
                    tinymce.each(nodes, function(node){
                        if (node.nodeName === type){ return false; }

                        if (node.nodeName === otherType) {
                            changeNodeType(node, type);
                        } else if (node.parentNode && node.parentNode.nodeName !== 'DL') {
                            createDefinitionList(node, type);
                        }
                    });
                });

            }

            function createDefinitionList(node, type){
                // InsertDefinitionList by default creates a DL with a DT
                ed.execCommand('InsertDefinitionList');
                if (type === 'DD') {
                    changeNodeType(node, type);
                }
            }

            function changeNodeType(node, type){
                ed.dom.rename(node, type);
            }

        },

        getInfo: function () {
            return {
                longname: 'CK-12 definitionlist ',
                author: 'Chetan Padhye',
                authorurl: 'http://www.ck12.org',
                infourl: 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version: '1.0'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12definitionlist', tinymce.plugins.CK12definitionlistPlugin);
})();