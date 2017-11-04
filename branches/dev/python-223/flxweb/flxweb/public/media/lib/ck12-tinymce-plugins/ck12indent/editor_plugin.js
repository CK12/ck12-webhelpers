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

    //private variables for plugin
    var INDENT_CLASS = 'x-ck12-indent',
        INDENTABLE_ELEMENTS = ['P', 'H3', 'H4', 'H5', 'PRE', 'SPAN'];

    tinymce.create('tinymce.plugins.CK12IndentPlugin', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */

        init: function (ed /*, url*/ ) {

            /*if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12indent';
            }*/

            // Register the commands so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
            // or ck12indent & ck12outdent button
            ed.addCommand('mceIndent', function () {
                var isIndent = false;
                tinymce.each(ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()), function (element) {
                    if (-1 !== INDENTABLE_ELEMENTS.indexOf(element.tagName.toUpperCase())) {
                        element.classList.add(INDENT_CLASS);
                        isIndent = true;
                    }
                });

                if (!isIndent) {
                    ed.execCommand('Indent');
                }
            });

            ed.addCommand('mceOutdent', function () {
                var isOutdent = false;
                tinymce.each(ed.selection.getSelectedBlocks(ed.selection.getStart(), ed.selection.getEnd()), function (element) {
                    if (-1 !== INDENTABLE_ELEMENTS.indexOf(element.tagName.toUpperCase())) {
                        element.classList.remove(INDENT_CLASS);
                        isOutdent = true;
                    }
                    var listElement, dom = ed.dom;
                    if ('DD' === element.tagName.toUpperCase() || 'DT' === element.tagName.toUpperCase()) {
                        listElement = element.parentNode;
                        dom.split(listElement, element);
                        $(element).replaceWith('<p>' + $(element).html() + '</p>');
                    }
                });

                if (!isOutdent) {
                    ed.execCommand('Outdent');
                }
            });

            // Add a node change handler, set reset indent, outdent buttons in the UI,
            // initially and for P indent enabled outdent blocked.
            ed.onNodeChange.add(function (ed, cm, n) {

                cm.setDisabled('ck12indent', false);
                cm.setDisabled('ck12outdent', true);
                //Bug 12778 - Reduce indent button is inconsistent: 'P within P is removed on nodechange'
                if (n.parentNode && n.parentNode.nodeName === 'P' && n.nodeName === 'P') {
                    $(n).unwrap();
                }

                if (-1 !== INDENTABLE_ELEMENTS.indexOf(n.nodeName) && !(n.classList.contains(INDENT_CLASS))) {
                    cm.setDisabled('ck12indent', false);
                    cm.setDisabled('ck12outdent', true);
                } else if (-1 !== INDENTABLE_ELEMENTS.indexOf(n.nodeName) && n.classList.contains(INDENT_CLASS)) {
                    cm.setDisabled('ck12indent', true);
                    cm.setDisabled('ck12outdent', false);
                } else if ('DL' === n.nodeName || 'DD' === n.nodeName || 'DT' === n.nodeName) {
                    cm.setDisabled('ck12indent', true);
                    cm.setDisabled('ck12outdent', false);
                } else if (ed && ed.parents && ed.parents.length > 0) {

                    var i, arrElm, ic;
                    for (i = 0; i < ed.parents.length; i++) {

                        arrElm = ed.parents[i];
                        if (-1 !== INDENTABLE_ELEMENTS.indexOf(arrElm.tagName.toUpperCase()) && arrElm.classList.contains(INDENT_CLASS)) {
                            cm.setDisabled('ck12indent', true);
                            cm.setDisabled('ck12outdent', false);
                        } else if ('UL' === arrElm.tagName.toUpperCase() || 'OL' === arrElm.tagName.toUpperCase()) {
                            ic = 0;
                            $(n).parents().each(function () {
                                if (this.tagName === 'OL' || this.tagName === 'UL') {
                                    ic++;
                                }
                            });
                            if (ic >= 5) {
                                cm.setDisabled('ck12indent', true);
                            }
                            if (ic !== 0) {
                                cm.setDisabled('ck12outdent', false);
                            }
                        } else if ('DL' === arrElm.tagName.toUpperCase() || 'DD' === arrElm.tagName.toUpperCase() || 'DT' === arrElm.tagName.toUpperCase()) {
                            cm.setDisabled('ck12indent', true);
                            cm.setDisabled('ck12outdent', false);
                        } else {
                            cm.setDisabled('ck12indent', false);
                            cm.setDisabled('ck12outdent', true);
                        }
                    }
                } else {
                    cm.setDisabled('ck12indent', false);
                    cm.setDisabled('ck12outdent', true);
                }
            });

            // Register indent button
            ed.addButton('ck12indent', {
                'title': 'Increase Indent',
                'cmd': 'mceIndent',
                'class': 'mce_indent'
            });

            // Register outdent button
            ed.addButton('ck12outdent', {
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
}());