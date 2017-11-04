/**
 *
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('ck12link', function(editor) {
    'use strict';

    var lastSelectedRng;

    // Use as plugin elsewhere...
    var Base64 = {
        _keyStr : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.',

        // public method for encoding
        encode : function (input) {
            var output = '';
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },
        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }
    }

    function createLinkList(callback) {
        return function() {
            var linkList = editor.settings.link_list;

            if (typeof linkList === 'string') {
                tinymce.util.XHR.send({
                    url: linkList,
                    success: function(text) {
                        callback(tinymce.util.JSON.parse(text));
                    }
                });
            } else if (typeof linkList === 'function') {
                linkList(callback);
            } else {
                callback(linkList);
            }
        };
    }

    function buildListItems(inputList, itemCallback, startItems) {
        function appendItems(values, output) {
            output = output || [];

            tinymce.each(values, function(item) {
                var menuItem = {text: item.text || item.title};

                if (item.menu) {
                    menuItem.menu = appendItems(item.menu);
                } else {
                    menuItem.value = item.value;

                    if (itemCallback) {
                        itemCallback(menuItem);
                    }
                }

                output.push(menuItem);
            });

            return output;
        }

        return appendItems(inputList, startItems || []);
    }

    function showDialog(linkList) {
        var data = {}, selection = editor.selection, dom = editor.dom, selectedElm, anchorElm, initialText;
        var win, onlyText, textListCtrl, linkListCtrl, relListCtrl, targetListCtrl, classListCtrl, linkTitleCtrl, anchorCtrl, value;

        function linkListChangeHandler(e) {
            var textCtrl = win.find('#text');

            if (!textCtrl.value() || (e.lastControl && textCtrl.value() === e.lastControl.text())) {
                textCtrl.value(e.control.text());
            }

            win.find('#href').value(e.control.value());
        }

        function buildAnchorListControl(url) {
            var anchorList = [];

            createAnchorList(url, anchorList);

            // Always add one as the list needs at least one value
            anchorList.unshift({text: 'None', value: ''});

            return {
                name: 'anchor',
                type: 'listbox',
                label: 'Anchors',
                values: anchorList,
                onselect: linkListChangeHandler
            };
        }

        function updateText() {
            if (!initialText && data.text.length === 0 && onlyText) {
                this.parent().parent().find('#text')[0].value(this.value());
            }
        }

        function urlChange(e) {
            var meta = e.meta || {};

            if (linkListCtrl) {
                linkListCtrl.value(editor.convertURL(this.value(), 'href'));
            }

            tinymce.each(e.meta, function(value, key) {
                win.find('#' + key).value(value);
            });

            if (!meta.text) {
                updateText.call(this);
            }
        }


        function createAnchorList (url, anchorArray) {
            getAnchorImages(url, anchorArray);
            getAnchorTables(url, anchorArray);
            getAnchorEmbedObjects(url, anchorArray);
        }

        function getAnchorImages (url, anchorArray) {
            var id, i, n, nodes, len,
                count = 0;

            nodes = editor.dom.select('img');
            for (i = 0, len = nodes.length; i < len; i++) {
                n = nodes[i];
                // non inline image
                if (n.parentNode.nodeName !== 'SPAN' && n.className.indexOf('ck12-media-placeholder') === -1) {
                    id = editor.dom.getAttrib(n, 'id');
                    if (id && id.indexOf('x-ck12-') !== -1) {
                        anchorArray.push(createAnchorItem(id, 'Figure', count++, url));
                    } else {
                        id = new Date().getTime().toString();
                        id = 'x-ck12-' + Base64.encode(id);
                        editor.dom.setAttrib(n, 'id', id);
                        anchorArray.push(createAnchorItem(id, 'Figure', count++, url));
                    }
                }
            }
        }

        function getAnchorTables (url, anchorArray) {
            var id, i, len, n, nodes,
                count = 0;

            nodes = editor.dom.select('table');
            for (i = 0, len = nodes.length; i < len; i++) {
                n = nodes[i];

                if (editor.dom.getAttrib(n, 'class').indexOf('x-ck12-element-box-placeholder') === -1) {
                    id = editor.dom.getAttrib(n, 'id');
                    if (id && id.indexOf('x-ck12-') !== -1) {
                        anchorArray.push(createAnchorItem(id, 'Table', count++, url));
                    } else {
                        id = new Date().toString();
                        id = 'x-ck12-' + Base64.encode(id);
                        editor.dom.setAttrib(n, 'id', id);
                        anchorArray.push(createAnchorItem(id, 'Table', count++, url));
                    }
                }
            }
        }

        function getAnchorEmbedObjects (url, anchorArray) {
            var id, i, len, n, nodes,
                count = 0;

            nodes = editor.dom.select('.ck12-media-placeholder');
            for (i = 0, len = nodes.length; i < len; i++) {
                n = nodes[i];
                id = editor.dom.getAttrib(n, 'data-ck12embed-iframe-id');
                if (id && id.indexOf('x-ck12-') !== -1) {
                    anchorArray.push(createAnchorItem(id, 'Object', count++, url));
                } else {
                    id = new Date().toString();
                    id = 'x-ck12-' + Base64.encode(id);
                    editor.dom.setAttrib(n, 'data-ck12embed-iframe-id', id);
                    anchorArray.push(createAnchorItem(id, 'Object', count++, url));
                }
            }
        }

        function createAnchorItem(id, type, count, url){
            return {
                text: type + ' ' + (count + 1) + ' (' + id.replace('x-ck12-', '') + ')',
                value: '#' + id,
                selected: url.indexOf('#' + id) !== -1
            };
        }

        function isOnlyTextSelected(anchorElm) {
            var html = selection.getContent();
            // Partial html and not a fully selected anchor element
            if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') === -1)) {
                return false;
            }

            if (anchorElm) {
                var nodes = anchorElm.childNodes, i;

                if (nodes.length === 0) {
                    return false;
                }

                for (i = nodes.length - 1; i >= 0; i--) {
                    if (nodes[i].nodeType !== 3) {
                        return false;
                    }
                }
            }

            return true;
        }

        setSelection();

        selectedElm = selection.getNode();

        anchorElm = dom.getParent(selectedElm, 'a[href]');
        onlyText = isOnlyTextSelected();

        data.text = initialText = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({format: 'text'});
        data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';

        if (anchorElm) {
            data.target = dom.getAttrib(anchorElm, 'target');
        } else if (editor.settings.default_link_target) {
            data.target = editor.settings.default_link_target;
        }

        if ((value = dom.getAttrib(anchorElm, 'rel'))) {
            data.rel = value;
        }

        if ((value = dom.getAttrib(anchorElm, 'class'))) {
            data['class'] = value;
        }

        if ((value = dom.getAttrib(anchorElm, 'title'))) {
            data.title = value;
        }

        if (onlyText) {
            textListCtrl = {
                name: 'text',
                type: 'textbox',
                size: 40,
                label: 'Text to display',
                onchange: function() {
                    data.text = this.value();
                }
            };
        }

        if (linkList) {
            linkListCtrl = {
                type: 'listbox',
                label: 'Link list',
                values: buildListItems(
                    linkList,
                    function(item) {
                        item.value = editor.convertURL(item.value || item.url, 'href');
                    },
                    [{text: 'None', value: ''}]
                ),
                onselect: linkListChangeHandler,
                value: editor.convertURL(data.href, 'href'),
                onPostRender: function() {
                    linkListCtrl = this;
                }
            };
        }

        if (editor.settings.target_list !== false) {
            if (!editor.settings.target_list) {
                editor.settings.target_list = [
                    {text: 'None', value: ''},
                    {text: 'New window', value: '_blank'}
                ];
            }

            targetListCtrl = {
                name: 'target',
                type: 'listbox',
                label: 'Target',
                values: buildListItems(editor.settings.target_list)
            };
        }

        if (editor.settings.rel_list) {
            relListCtrl = {
                name: 'rel',
                type: 'listbox',
                label: 'Rel',
                values: buildListItems(editor.settings.rel_list)
            };
        }

        if (editor.settings.link_class_list) {
            classListCtrl = {
                name: 'class',
                type: 'listbox',
                label: 'Class',
                values: buildListItems(
                    editor.settings.link_class_list,
                    function(item) {
                        if (item.value) {
                            item.textStyle = function() {
                                return editor.formatter.getCssText({inline: 'a', classes: [item.value]});
                            };
                        }
                    }
                )
            };
        }

        if (editor.settings.link_title !== false) {
            linkTitleCtrl = {
                name: 'title',
                type: 'textbox',
                label: 'Title',
                value: data.title
            };
        }

        if (editor.settings.anchor !== false && editor.settings.rel_list) {
            anchorCtrl = {
                name: 'anchor',
                type: 'listbox',
                label: 'Anchor',
                values: buildListItems(editor.settings.rel_list)
            };
        }

        win = editor.windowManager.open({
            title: 'Insert link',
            data: data,
            buttons: [
                {text: 'Cancel', onclick: 'close'},
                {
                    text: 'Insert',
                    onclick: 'submit',
                    classes: 'primary'
                }
            ],
            body: [
                {
                    name: 'href',
                    type: 'filepicker',
                    filetype: 'file',
                    size: 40,
                    autofocus: true,
                    label: 'Url',
                    onchange: urlChange,
                    onkeyup: updateText
                },
                textListCtrl,
                linkTitleCtrl,
                anchorCtrl,
                buildAnchorListControl(data.href),
                linkListCtrl,
                relListCtrl,
                targetListCtrl,
                classListCtrl
            ],
            onSubmit: function(e) {
                /*eslint dot-notation: 0*/
                var href, isExternalTest, isExternalTest2;

                data = tinymce.extend(data, e.data);
                href = data.href;

                // Delay confirm since onSubmit will move focus
                function delayedConfirm(message, callback) {
                    var rng = editor.selection.getRng();

                    window.setTimeout(function() {
                        editor.windowManager.confirm(message, function(state) {
                            editor.selection.setRng(rng);
                            callback(state);
                        });
                    }, 0);
                }

                function insertLink() {
                    var linkAttrs = {
                        href: href,
                        target: data.target ? data.target : null,
                        rel: data.rel ? data.rel : null,
                        "class": data["class"] ? data["class"] : null,
                        title: data.title ? data.title : null
                    };

                    if (anchorElm) {
                        editor.focus();

                        if (onlyText && data.text != initialText) {
                            if ("innerText" in anchorElm) {
                                anchorElm.innerText = data.text;
                            } else {
                                anchorElm.textContent = data.text;
                            }
                        }

                        dom.setAttribs(anchorElm, linkAttrs);

                        selection.select(anchorElm);
                        editor.undoManager.add();

                    } else {
                        if (onlyText) {
                            editor.insertContent(dom.createHTML('a', linkAttrs, dom.encode(data.text)));
                        } else {
                            editor.execCommand('mceInsertLink', false, linkAttrs);
                        }
                    }
                }

                if (!href) {
                    editor.execCommand('unlink');
                    return;
                }

                // Is email and not //user@domain.com
                if (href.indexOf('@') > 0 && href.indexOf('//') === -1 && href.indexOf('mailto:') === -1) {
                    delayedConfirm(
                        'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
                        function(state) {
                            if (state) {
                                href = 'mailto:' + href;
                            }

                            insertLink();
                        }
                    );

                    return;
                }

                isExternalTest = (editor.settings.link_assume_external_targets && !/^\w+:/i.test(href));
                isExternalTest2 = (!editor.settings.link_assume_external_targets && /^\s*www\./i.test(href));

                // Is not protocol prefixed and not a x-ck12 anchor hash
                if ( (isExternalTest || isExternalTest2) && !(/^#x-ck12-/i.test(href)) ) {
                    delayedConfirm(
                        'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
                        function(state) {
                            if (state) {
                                href = 'http://' + href;
                            }

                            insertLink();
                        }
                    );

                    return;
                }

                insertLink();
            }
        });
        editor.fire('focus:window');
    }

    var contextMenu = {
        postRender: function(editor) {
            var ctrl = this;

            function handleDisable () {
                var selection, el, elText, disabledState;
                setSelection();

                selection     = editor.selection;
                el            = selection.getNode() || editor.getBody();
                elText        = el.textContent || el.innerText;
                disabledState = typeof elText === 'string' && elText.trim().length > 0;

                ctrl.disabled( !disabledState );
                ctrl.visible( disabledState );
            }

            function bindListener () {
                editor.on('contextmenu:reselect', function(e){
                    lastSelectedRng = e.range || null;
                    handleDisable();
                });
            }

            if (editor.initialized) {
                bindListener();
            } else {
                editor.on('init', bindListener);
            }
        }
    },
    toolbar = {
        postRender: function(editor){
            var ctrl = this;

            function handleDisable () {
                var dom = editor.dom,
                    selection = editor.selection,
                    el = selection.getNode() || editor.getBody(),
                    disabledState = false;

                // force disable when it's an image and not inline
                if (editor.events && editor.events.ck12image && editor.events.ck12image.isImage(el, dom)) {
                    if(editor.events.ck12image.isInlineImage && !editor.events.ck12image.isInlineImage(el, dom)){
                        disabledState = true;
                    }
                }
                ctrl.disabled( disabledState );
            }

            function bindListener () {
                editor.on('nodechange', handleDisable);
            }

            if (editor.initialized) {
                bindListener();
            } else {
                editor.on('init', bindListener);
            }
        }
    };

    editor.addButton('link', {
        icon: 'link',
        tooltip: 'Insert/Edit link',
        shortcut: 'Meta+K',
        onclick: createLinkList(showDialog),
        stateSelector: 'a[href]',
        onPostRender: function(){
            toolbar.postRender.call(this, editor);
        }
    });

    editor.addButton('unlink', {
        icon: 'unlink',
        tooltip: 'Remove link',
        cmd: 'unlink',
        stateSelector: 'a[href]',
        onPostRender: function(){
            toolbar.postRender.call(this, editor);
        }
    });

    editor.addShortcut('Meta+K', '', createLinkList(showDialog));
    editor.addCommand('mceLink', createLinkList(showDialog));

    this.showDialog = showDialog;

    editor.addMenuItem('link', {
        icon: 'link',
        text: 'Insert/Edit link',
        shortcut: 'Meta+K',
        onclick: createLinkList(showDialog),
        onPostRender: function(){
            contextMenu.postRender.call(this, editor);
        },
        context: 'insert',
        prependToContext: true
    });

    editor.addMenuItem('unlink', {
        icon: 'unlink',
        text: 'Unlink',
        cmd: 'unlink',
        onPostRender: function(){
            contextMenu.postRender.call(this, editor);
        },
        context: 'insert',
        prependToContext: true
    });

    function setSelection() {
        var currentRng = editor.selection.getRng();
        if(lastSelectedRng && currentRng !== lastSelectedRng){
            editor.selection.setRng(lastSelectedRng);
            lastSelectedRng = null;
        } else if (currentRng === lastSelectedRng) {
            lastSelectedRng = null;
        }
    }

});
