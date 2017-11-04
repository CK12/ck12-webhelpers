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
/*globals $, tinymce, tinyMCE, document, window, console, setTimeout */
/*eslint
 quotes: [2, "single"],
 curly: 2,
 yoda: [2, "always", {"onlyEquality": true}],
 "no-console": 0,
 "indent": [2, 4],
 "semi": [2, "always"]
 */
(function () {
    'use strict';

    tinymce.create('tinymce.plugins.CK12ValidatorPlugin', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init: function (ed /*, url*/ ) {
            this.initializePlugin(ed);
        },
        initializePlugin: function (ed) {

            var prevContent,
                t = this,
                DIRTY_CLASS = 'x-ck12-dirty',
                VALIDATIONERROR_CLASS = 'x-ck12-validationerror',
                VALIDATED_CLASS = 'x-ck12-validated',
                acceptableID = ['__mce_tmp', 'ck12image', '__mce_tmp_caption', 'previewImg'],
                acceptableClass = ['ck12-media-placeholder', 'mceItemTable'],
                acceptableDataAttributes = ['data-error', 'data-mce-src'],
                forceRemoveAttributes = ['mce_bogus'],
                IDList = [],
                InvalidImages = [],
                listElements = ['ul', 'ol'],
                invalidElements = ['nobr'];

            t.editor = ed;

            function renderErrorDialog() {
                if (!ed.id || -1 !== ed.id.indexOf('chapter')) {
                    return false;
                }
                var errorNodes = ed.dom.select('.' + VALIDATIONERROR_CLASS);
                //                $('#validating-progress').addClass('hide');
                if (errorNodes instanceof Array && errorNodes.length) {
                    if ($(errorNodes).eq(0).data('error')) {
                        //                        $('#validating-check').addClass('hide');
                        $('.js_save_artifact').addClass('disabled js-disabled');
                        $('#data-image-alert-container').removeClass('hide').data('target', $(errorNodes).eq(0)).data('errors', errorNodes).data('current', 0);
                        /*if (errorNodes.length > 1) {
                            $('#data-image-alert-container').find('.js-next-error').removeClass('hide');
                        } else {
                            $('#data-image-alert-container').find('.js-next-error').addClass('hide');
                        }*/
                    } else {
                        $(errorNodes).eq(0).removeClass(VALIDATIONERROR_CLASS);
                        renderErrorDialog();
                    }
                } else {
                    //                    $('#validating-success').removeClass('hide').siblings().addClass('hide');
                    $('#data-image-alert-container').addClass('hide');
                }
            }

            function removeEmptyandDataAttributes(node) {
                var attribIndex, attribName,
                    attributesArray = [],
                    domAttributes = node.attributes;
                if (domAttributes.length) {
                    for (attribIndex = 0; attribIndex < domAttributes.length; attribIndex++) {
                        attribName = domAttributes[attribIndex].name;
                        if ('type' !== attribName && 'input' === node.nodeName.toLowerCase()) {
                            // do not change type property on an input (due to browser constraints), trim all other properties of all other elements
                            $(node).attr(attribName, (domAttributes[attribIndex].value || '').trim());
                        }
                        if (0 === attribName.indexOf('data-') && -1 === acceptableDataAttributes.indexOf(attribName) && -1 === attribName.indexOf('data-ck12embed-')) {
                            attributesArray.push(domAttributes[attribIndex].name);
                        }
                        if (attribName && !domAttributes[attribIndex].value) {
                            attributesArray.push(domAttributes[attribIndex].name);
                        }
                        if (-1 !== forceRemoveAttributes.indexOf(attribName)) {
                            attributesArray.push(domAttributes[attribIndex].name);
                        }
                    }
                    $(node).removeAttr(attributesArray.join(' '));
                }
            }

            function removeAttributes($node, domAttributes) {
                var attribIndex,
                    attributesArray = [],
                    isString = 'string' === typeof domAttributes || domAttributes instanceof String;
                if (isString) {
                    domAttributes = domAttributes.split(' ');
                }
                if (domAttributes.length) {
                    for (attribIndex in domAttributes) {
                        if (domAttributes.hasOwnProperty(attribIndex)) {
                            if (domAttributes[attribIndex].name) {
                                attributesArray.push(domAttributes[attribIndex].name);
                            } else if (isString) {
                                attributesArray.push(domAttributes[attribIndex]);
                            }
                        }
                    }
                    $node.removeAttr(attributesArray.join(' '));
                }
            }

            function removeDataAttributes($node, domAttributes) {
                var attribIndex, attributesArray = [];
                if (domAttributes.length) {
                    for (attribIndex in domAttributes) {
                        if (domAttributes.hasOwnProperty(attribIndex)) {
                            if (domAttributes[attribIndex].name && domAttributes[attribIndex].name.match(/data-.*/g)) {
                                attributesArray.push(domAttributes[attribIndex].name);
                            }
                        }
                    }
                    $node.removeAttr(attributesArray.join(' '));
                }
            }

            function checkforDataImages() {
                if ('img' === this.nodeName.toLowerCase()) {
                    if (-1 !== this.src.indexOf('data:image')) {
                        $(document).trigger($.flxweb.editor.tinymce.events.DATA_IMAGE, this);
                        $(this).addClass('x-ck12-dataimage-' + window.imageClassIterator);
                    }
                }
            }

            function checkForInvalidSRC(self) {
                if (0 === $(self).attr('src').indexOf('/flx/show')) {
                    // CK-12 relative url
                    return false;
                }

                if (0 === $(self).attr('src').indexOf('/flx/math')) {
                    // math images
                    return false;
                }

                if (0 === $(self).attr('src').indexOf('/flx/render')) {
                    // render images
                    return false;
                }

                if (0 === $(self).attr('src').indexOf('/media')) {
                    // local images
                    return false;
                }

                if ($(self).attr('src').split('//')[1] && $(self).attr('src').split('//')[1] === $(self).prop('src').split('//')[1]) {
                    // absolute url
                    return false;
                }

                return true;
            }

            function getParentBlock(n, editorObj) {
                var d = editorObj.dom;
                return d.getParent(n, d.isBlock);
            }

            function checkForInvalidCK12Content() {

                if ($(this).hasClass('x-ck12-mathEditor') || $(this).parents('.x-ck12-mathEditor').length) {
                    return this;
                }

                if (-1 !== invalidElements.indexOf((this.tagName || '').toLowerCase())) {
                    $(this).remove();
                    return false;
                }

                if ('img' === this.tagName.toLowerCase()) {
                    if (checkForInvalidSRC(this)) {
                        if (-1 === InvalidImages.indexOf($(this).attr('src'))) {
                            InvalidImages.push($(this).attr('src'));
                        }
                        if ($(this).parent().hasClass('x-ck12-img-inline')) {
                            // inline image
                            $(this).parent().remove();
                        } else {
                            $(getParentBlock(this, ed)).remove();
                        }
                        return false;
                    }
                }

                var index, classList = this.classList;

                if ((0 !== this.id.indexOf('x-ck12-') || 8 > this.id.length) && -1 === acceptableID.indexOf(this.id)) {
                    this.id = '';
                }
                for (index = 0; index < classList.length; index++) {
                    if ((0 !== classList.item(index).indexOf('x-ck12-') || 8 > classList.item(index).length) && -1 === acceptableClass.indexOf(classList.item(index))) {
                        classList.remove(classList.item(index));
                        index--;
                    }
                }
                removeEmptyandDataAttributes(this);
                return this;
            }

            function checkForDuplicateID() {
                if (this.id) {
                    if (-1 !== IDList.indexOf(this.id)) {
                        this.id = '';
                    } else {
                        IDList.push(this.id);
                    }
                }
                checkForInvalidCK12Content.call(this);
                checkforDataImages.call(this);
            }

            function checkForChild(div, el) {
                if (div.length === 0) {
                    var child = el.firstChild;
                    while (child) {
                        if (ed.dom.hasClass(child, VALIDATIONERROR_CLASS)) {
                            div.push(child);
                        }
                        child = child.nextSibling;
                    }
                }
                return div;
            }

            function processNode() {
                var $this = $(this);
                if ($this.prop('tagName') === 'NOBR') {
                    $this.remove();
                    return;
                }
                $this.removeAttr('role aria-readonly contenteditable').removeClass('MathJax MathJax_Display selectedElement showContextMenu ck12-media-placeholder doubleClick forSingleClick');
                removeDataAttributes($this, this.attributes);
                //$this.removeAttr('data-mce-bogus');
            }

            function b64EncodeUnicode(str) {
                return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
            }

            function validateBlocks() {

                if (!(ed.dom.doc)) {
                    return false;
                }

                var bookmark, wrap, domNodes, n, nodz, postdata,
                    tmpUpdate = $('<div>' + ed.getContent() + '</div>');
                if (tmpUpdate.find('#MathJax_Hidden').length > 0 && tmpUpdate.find('#MathJax_Hidden').parent().children().length === 1) {
                    tmpUpdate.find('#MathJax_Hidden').parent().remove();
                }
                $('div[id^="MathJax"]', tmpUpdate).remove();
                if ('' !== $(tmpUpdate).html().trim()) {
                    try {
                        bookmark = ed.selection.getBookmark();
                    } catch (e) {
                        // HIERARCHY_REQUEST_ERR bug - http://www.tinymce.com/develop/bugtracker_view.php?id=4512 - swallow exception
                        bookmark = null;
                    }
                    if (bookmark) {
                        ed.selection.moveToBookmark(bookmark);
                    }
                    domNodes = ed.dom.select('.x-ck12-dirty:not(".x-ck12-validated")');
                    nodz = [];
                    for (n in domNodes) {
                        if (domNodes.hasOwnProperty(n)) {
                            wrap = document.createElement('div');
                            // remove data-error / keep dirty flag.
                            $(domNodes[n]).removeAttr('data-error');
                            wrap.appendChild(domNodes[n].cloneNode(true));
                            $(wrap).find('*').each(processNode);
                            nodz[n] = wrap.innerHTML;
                        }
                    }
                    if (nodz && nodz.length > 0) {
                        /*postdata = {
                            'xhtmlList': JSON.stringify(nodz)
                        };*/
                        postdata = JSON.stringify(nodz);
                        $('.js_save_artifact').removeClass('disabled js-disabled');
                        //                        $('#validating-check').removeClass('hide');
                        //                        $('#validating-progress').removeClass('hide').siblings().addClass('hide');
                        $.ajax({
                            type: 'POST',
                            dataType: 'json',
                            contentType: 'text/plain',
                            url: '/flx/validate/validateXhtmlList',
                            data: b64EncodeUnicode(postdata),
                            success: function (responsedata) {
                                if (responsedata.response.hasOwnProperty('result') && 'Validated' === responsedata.response.result) {
                                    var i, validations;
                                    for (i in domNodes) {
                                        if (domNodes.hasOwnProperty(i)) {
                                            // Remove dirty flag for validated block.
                                            $(domNodes[i]).removeClass(DIRTY_CLASS).addClass(VALIDATED_CLASS);
                                            validations = responsedata.response.validations[i] instanceof Array ? responsedata.response.validations[i][0] : responsedata.response.validations[i];
                                            if ('valid' === validations) {
                                                // remove dirty flag
                                                // add data-error information
                                                $(domNodes[i]).removeClass(VALIDATIONERROR_CLASS).removeAttr('data-error');
                                            } else {
                                                $(domNodes[i]).addClass(VALIDATIONERROR_CLASS).attr('data-error', validations);
                                            }
                                        }
                                    }
                                } else {
                                    console.log('There is an error in the entered HTML.');
                                    console.log(nodz);
                                    console.log(responsedata.response.message || '');
                                    $(domNodes).eq(0).addClass(VALIDATIONERROR_CLASS).attr('data-error', responsedata.response.message || '');
                                }
                                prevContent = ed.getContent();
                                renderErrorDialog();
                            },
                            error: function () {}
                        });
                    }
                    $.each((ed.dom.select('.x-ck12-mathEditor[id]')), function () {
                        $(this).attr('contenteditable', false);
                    });
                }
                //  selection.moveToBookmark(bookmark);
                setTimeout(validateBlocks, 10000);
            }

            function isCharacterKey(keyCode) {
                if (8 === keyCode || 9 === keyCode || 13 === keyCode || 32 === keyCode || 46 === keyCode) {
                    // backspace, tab, enter, spacebar or delete
                    return true;
                }
                if (keyCode >= 48 && keyCode <= 57) {
                    // number keys
                    return true;
                }
                if (keyCode >= 65 && keyCode <= 90) {
                    // alphabet keys
                    return true;
                }
                if (keyCode >= 96 && keyCode <= 111) {
                    // numpad keys
                    return true;
                }
                if ((keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222)) {
                    // punctuation keys
                    return true;
                }
                return false;
            }

            function contentChanged() {
                //                $('#validating-check').removeClass('hide');
                //                $('#validating-progress').removeClass('hide').siblings().addClass('hide');
                $.flxweb.editor.current_artifact.trigger('change');
            }

            function editorKeyPressed(editorObj, event) {
                if (isCharacterKey(event.keyCode || event.which)) {
                    contentChanged();
                }

            }

            function checkForValidation(n, editorObj, currentContent) {

                var block = getParentBlock(n, editorObj);

                if (block) {
                    // add dirty class to block elements.
                    if (currentContent && prevContent !== currentContent) {
                        editorObj.dom.removeClass(block, VALIDATED_CLASS);
                    }
                    if (!(editorObj.dom.hasClass(block, VALIDATED_CLASS))) {
                        editorObj.dom.addClass(block, DIRTY_CLASS);
                        checkForInvalidCK12Content.call(block);
                        $(block).find('*').each(checkForInvalidCK12Content);
                    }
                }
            }

            function checkListElement(element) {
                if (!(element && $(element) instanceof $ && $(element).length)) {
                    return false;
                }
                return -1 !== listElements.indexOf(($(element)[0].tagName || '').toLowerCase());
            }

            function testIfValidationIsRequired(childTextNode, currentNode) {
                if (childTextNode.length && childTextNode.text().trim()) {
                    var parents = $(currentNode).parents();
                    if (!(parents.filter('.' + DIRTY_CLASS).length || parents.filter('.' + VALIDATED_CLASS).length)) {
                        return true;
                    }
                }
                return false;
            }

            // Add a node change handler
            ed.onNodeChange.add(function (editorObj) {
                if (!(editorObj.dom.select('.' + VALIDATIONERROR_CLASS).length)) {
                    $('#data-image-alert-container').addClass('hide');
                    $('.js_save_artifact').removeClass('disabled js-disabled');
                    /*$('#validating-check').removeClass('hide');
                    if (editorObj.dom.select('.x-ck12-dirty:not(".x-ck12-validated")').length) {
                        $('#validating-progress').removeClass('hide').siblings().addClass('hide');
                    } else {
                        $('#validating-success').removeClass('hide').siblings().addClass('hide');
                    }*/
                }
                /*if (!($(editorObj.dom.select('body')).children().text())) {
                    $('#validating-check').addClass('hide');
                }*/
            });

            ed.onChange.add(function (editorObj, l) {
                if (l.hasOwnProperty('beforeBookmark')) {
                    return;
                }
                var content = $.flxweb.editor.removeValidatorattributes(l.content);
                if (prevContent !== content && !ed.selectEditorTab) {
                    checkForValidation(editorObj.selection.getNode(), editorObj, content);
                    prevContent = content;
                    contentChanged();
                }
            });

            ed.onKeyPress.add(editorKeyPressed);

            ed.onBeforeSetContent.add(function (editorObj, content) {
                if ((content.content || '').trim()) {
                    if (0 === $(content.content).length) {
                        content.content = '<p>' + content.content + '</p>';
                    }

                    //                    $('#validating-progress').removeClass('hide').siblings().addClass('hide');
                    var i, invalidText, childTextNode, temp = document.createElement('div');
                    temp = $(temp).append($(content.content));

                    // Validate (or invalidate) first level children
                    $(temp).children().each(function () {
                        if (editorObj.dom.isBlock(this)) {
                            $(this).addClass(DIRTY_CLASS);
                        } else if (1 === this.nodeType) {
                            // if not block element, remove validation classes from it
                            $(this).removeClass(DIRTY_CLASS).removeClass(VALIDATIONERROR_CLASS).removeClass(VALIDATED_CLASS);
                        }
                        childTextNode = $(this.childNodes).filter(function () {
                            return 3 === this.nodeType;
                        });
                        if (testIfValidationIsRequired(childTextNode, this)) {
                            checkForValidation(this, editorObj, false);
                        }
                    });

                    IDList = [];
                    InvalidImages = [];
                    $(temp).find('*').each(checkForDuplicateID);
                    if (InvalidImages.length) {
                        invalidText = '';
                        for (i = 0; i < InvalidImages.length; i++) {
                            invalidText += '<span>' + (i + 1) + '. ' + InvalidImages[i] + '</span></br>';
                        }
                        $.flxweb.editor.showSaveDialog({
                            'width': 670,
                            'className': 'sent-email-modal',
                            'headerText': 'The following images you have added are not supported by our editor. In case of any queries, please contact customer support.',
                            'contentText': invalidText,
                            'buttons': [{
                                'text': 'OK',
                                'className': 'turquoise',
                                'onclick': $.flxweb.editor.hideSaveDialog
                            }]
                        });
                        invalidText = '';
                        InvalidImages = [];
                    }
                    prevContent = $(temp).html();
                    content.content = prevContent;
                }
            });

            ed.onInit.add(function () {
                if (ed && ed.plugins.contextmenu) {

                    ed.plugins.contextmenu.onContextMenu.add(function (th, m, e) {
                        var se = ed.selection,
                            el = se.getNode() || ed.getBody(),
                            div = ed.dom.getParents(el, '.x-ck12-validationerror');
                        div = checkForChild(div, el);
                        if (div[0] && (ed.dom.getAttrib(div[0], 'class').indexOf(VALIDATIONERROR_CLASS) === -1)) {
                            div = ed.dom.getParent(e, 'p');
                        }
                        if ((div[0] && ed.dom.getAttrib(div[0], 'class').indexOf(VALIDATIONERROR_CLASS) !== -1) || (e.nodeName !== 'BODY' && ed.dom.getAttrib(e, 'class') && ed.dom.getAttrib(e, 'class').indexOf(VALIDATIONERROR_CLASS) !== -1)) {
                            m.removeAll();
                            m.add({
                                title: 'View Error Info',
                                icon: 'newdocument',
                                cmd: 'mceErrorIfno',
                                ui: true
                            });
                            m.add({
                                title: 'Remove Formatting',
                                icon: 'cancel',
                                cmd: 'mceRemoveFormatting',
                                ui: true
                            });
                            m.add({
                                title: 'Remove Element',
                                icon: 'cancel',
                                cmd: 'mceRemoveElement',
                                ui: true
                            });
                            m.add({
                                title: 'Revalidate',
                                icon: 'revalidate',
                                cmd: 'mceRevalidate',
                                ui: true
                            });
                            m.addSeparator();
                        }
                    });
                }
                // It calls Node change which marks current node dirty even if it is not edited.
                ed.setContent(ed.getContent({
                    cleanup: true
                }), {
                    cleanup: true
                });
                validateBlocks();
            });

            ed.addCommand('mceRemoveElement', function () {
                var div, el = ed.selection.getNode();
                div = ed.dom.getParents(el, '.x-ck12-validationerror');
                div = checkForChild(div, el);
                if (div[0] && (ed.dom.getAttrib(div[0], 'class').indexOf(VALIDATIONERROR_CLASS) !== -1)) {
                    div[0].parentNode.removeChild(div[0]);
                } else if (el && (ed.dom.getAttrib(el, 'class').indexOf(VALIDATIONERROR_CLASS) !== -1)) {
                    el.parentNode.removeChild(el);
                } else {
                    div = ed.dom.getParent(el, 'p');
                    if (ed.dom.getAttrib(div, 'class').indexOf(VALIDATIONERROR_CLASS) !== -1) {
                        div.parentNode.removeChild(div);
                    }
                }
            });
            ed.addCommand('mceRemoveFormatting', function () {
                var el = ed.selection.getNode();
                el = ed.dom.getParents(el, '.x-ck12-validationerror');
                removeAttributes($(el[0]), el[0].attributes);
                ed.dom.addClass(el[0], DIRTY_CLASS);
                el = $(el[0]);
                if (checkListElement(el[0])) {
                    el = $(el[0]).children();
                } else {
                    el = $(el[0]);
                }
                el.each(function () {
                    this.innerHTML = $(this).text();
                });
            });

            ed.addCommand('mceRevalidate', function () {
                var el = ed.selection.getNode();
                el = ed.dom.getParents(el, '.x-ck12-validationerror');
                checkForInvalidCK12Content.call(el[0]);
                el[0].classList.add(DIRTY_CLASS);
                el[0].classList.remove(VALIDATED_CLASS);
            });

            ed.addCommand('mceErrorIfno', function () {
                var div, el = ed.selection.getNode(),
                    errorInfo = '';
                div = ed.dom.getParents(el, '.x-ck12-validationerror');
                div = checkForChild(div, el);
                if ((ed.dom.getAttrib(el, 'class').indexOf(VALIDATIONERROR_CLASS) !== -1) || (ed.dom.getAttrib(div[0], 'class').indexOf(VALIDATIONERROR_CLASS) !== -1)) {
                    errorInfo = $(el).attr('data-error') || $(div[0]).attr('data-error');
                } else {
                    div = ed.dom.getParent(el, 'p');
                    if (ed.dom.getAttrib(div, 'class').indexOf(VALIDATIONERROR_CLASS) !== -1) {
                        errorInfo = $(div).attr('data-error');
                    }
                }
                tinyMCE.activeEditor.windowManager.alert(errorInfo);
            });
        },
        getInfo: function () {
            return {
                longname: 'CK-12 Validator ',
                author: 'Chetan Padhye',
                authorurl: 'http://www.ck12.org',
                infourl: 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version: '1.0'
            };
        }
    });
    // Register plugin
    tinymce.PluginManager.add('ck12validator', tinymce.plugins.CK12ValidatorPlugin);
}());
