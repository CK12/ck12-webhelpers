
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

/* globals tinymce:true, $:true */

(function () {
    'use strict';
    //private variables for plugin
    var INDENT_CLASS = 'x-ck12-indent',
        INDENTABLE_ELEMENTS = ['P', 'H3', 'H4', 'H5', 'PRE', 'SPAN'],
        TEXT_STYLE_ELEMENTS = ['SUB', 'SUP', 'EM', 'STRONG'],
        DESCRIPTION_ELEMENTS = ['DL', 'DT', 'DD'],
        LIST_COLLECTION_ELEMENTS = ['OL', 'UL'];

    tinymce.create('tinymce.plugins.CK12IndentPlugin', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */

        init: function (ed, url) {

            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12indent';
            }


            function allowOutdent(){
                ed.fire('disable', { button: 'ck12indent' });
                ed.fire('enable', { button: 'ck12outdent' });
            }

            function allowIndent(){
                ed.fire('enable', { button: 'ck12indent' });
                ed.fire('disable', { button: 'ck12outdent' });
            }

            function disableBoth(){
                ed.fire('disable', { buttons: ['ck12indent', 'ck12outdent'] });
            }

            function enableBoth(){
                ed.fire('enable', { buttons: ['ck12indent', 'ck12outdent'] });
            }

            function contains(array, item){
                return array.indexOf(item) > -1;
            }

            function containsNode(array, node){
                if (!node || !node.nodeName){ return false; }
                return contains(array, node.nodeName.toUpperCase());
            }

            function has(array){
                if (!(array instanceof Array)){ return false; }
                return array.length > 0;
            }

            function isIndentable(node){
                return containsNode(INDENTABLE_ELEMENTS, node);
            }

            function isListElement(node){
                return containsNode(['LI'], node);
            }

            function isWithinBlockquote(node){
                return has( ed.dom.getParents(node, 'blockquote'));
            }

            function isStyledText(node){
                return containsNode(TEXT_STYLE_ELEMENTS, node);
            }

            function isIndented(node){
                return node.classList.contains(INDENT_CLASS) || hasIndentedParent(node);
            }

            function isImage(node){
                return (ed.events.ck12image.isImage(node) || ed.events.ck12image.isInlineImage(node));
            }

            function isElementBox(node){
                return ed.events.elementbox.isElementBox(node);
            }

            function getParents(node, parents){
                if (parents instanceof Array){ parents = parents.join(','); }
                return ed.dom.getParents(node, parents);
            }

            function getCommonParent(node){
                return ed.dom.getParent(node, 'P, DIV') || node;
            }

            function getListCollectionParents(node) {
                return getParents(node, LIST_COLLECTION_ELEMENTS);
            }

            function getDescriptionParents(node) {
                return getParents(node, DESCRIPTION_ELEMENTS);
            }

            function hasIndentedParent(node){
                return has( getParents(node, '.' + INDENT_CLASS) );
            }

            // Register the commands so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
            // or ck12indent & ck12outdent button
            ed.addCommand('mceIndent', function () {
                var isIndent = false;
                tinymce.each(ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()), function (element) {
                    var target = element;

                    if( isIndentable(element) && !isIndented(element) ) {
                        if(element.nodeName === 'SPAN'){
                            target = getCommonParent(element);
                        }

                        target.classList.add(INDENT_CLASS);
                        isIndent = true;
                    }
                });

                if (!isIndent) {
                    ed.execCommand('Indent');
                    ed.nodeChanged();
                }
            });

            ed.addCommand('mceOutdent', function () {
                var isOutdent = false;

                tinymce.each(ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()), function (element) {
                    var dom = ed.dom, listElement;

                    if( isIndentable(element) && (element.className && isIndented(element)) ) {
                        element.classList.remove(INDENT_CLASS);
                        isOutdent = true;
                    }

                    if (element.nodeName.toUpperCase() === 'DT'){
                        listElement = element.parentNode;
                        dom.split(listElement, element);
                        $(element).replaceWith('<p>' + $(element).html() + '</p>');
                    }
                });

                if (!isOutdent) {
                    ed.execCommand('Outdent');
                    ed.nodeChanged();
                }
            });

            function handleListCollection(listCollection, node){
                var li = isListElement(node) ? node : ed.dom.getParent(node, 'li');
                if(listCollection.length >= 5){
                    return allowOutdent();
                } else if (li && isListElement(li.previousElementSibling)){
                    return enableBoth();
                }
                //List collections with one should not be able to be indented
                return allowOutdent();
            }

            function handleDescription(descriptionCollection){
                var el = descriptionCollection.filter(function(node){
                        return node.nodeName !== 'DL';
                    });

                if(el[0] && el[0].nodeName === 'DT'){
                    enableBoth();
                } else {
                    allowOutdent();
                }
            }

            // Add a node change handler, set reset indent, outdent buttons in the UI,
            // initially and for P indent enabled outdent blocked.
            ed.on('nodechange', function (e) {
                var n = isStyledText(e.element) ? getCommonParent(e.element) : e.element,
                    listCollection,
                    descriptionCollection;

                if( isImage(n) || isElementBox(n) || isWithinBlockquote(n) ) { return disableBoth(); }

                listCollection = getListCollectionParents(n);
                if( has(listCollection) ){ return handleListCollection(listCollection, n); }

                descriptionCollection = getDescriptionParents(n);
                if( has(descriptionCollection) ){ return handleDescription(descriptionCollection); }

				//Bug 12778 - Reduce indent button is inconsistent: "P within P is removed on nodechange"
                if(n.parentNode && n.parentNode.nodeName === 'P' && n.nodeName === 'P') {
                    $(n).unwrap();
                }

                if ( isIndentable(n) && !isIndented(n) ) {
                    allowIndent();
                } else if ( isIndentable(n) && isIndented(n) ) {
                    allowOutdent();
                } else {
                    disableBoth();
                }
            });

            // Register indent button
            ed.addButton('ck12indent', {
                'icon': 'indent',
                'title': 'Increase Indent',
                'cmd': 'mceIndent',
                'class': 'mce_indent'
            });

            // Register outdent button
            ed.addButton('ck12outdent', {
                'icon': 'outdent',
                'title': 'Decrease Indent',
                'cmd': 'mceOutdent',
                'class': 'mce_outdent'
            });
        },

        getInfo: function () {
            return {
                longname: 'CK-12 Indent ',
                author: 'Chetan Padhye',
                authorurl: 'http://www.ck12.org',
                infourl: 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version: '1.0'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12indent', tinymce.plugins.CK12IndentPlugin);
})();
