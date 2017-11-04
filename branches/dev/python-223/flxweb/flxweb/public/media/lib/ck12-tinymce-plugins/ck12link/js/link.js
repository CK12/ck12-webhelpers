tinyMCEPopup.requireLangPack();

var anchorArray;

var LinkDialog = {

    getWin: function () {
        'use strict';
        return window.dialogArguments || opener || parent || top;
    },

    preInit: function () {
        'use strict';
        var url = tinyMCEPopup.getParam('external_link_list_url');
        if (url) {
            document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
        }
    },

    init: function () {
        'use strict';
        tinyMCEPopup.resizeToInnerSize();
        var html, elm,
            inst = tinyMCEPopup.editor,
            action = 'insert';
        // Anchor list

        if (this.getWin().document.body.classList.contains('question-builder')) {
            elm = document.getElementById('default-link');
            elm.parentNode.removeChild(elm);
        }
        html = this.getAnchorList('anchorlist', 'href');
        if (!html) {
            document.getElementById('anchorlistrow')
                .style.display = 'none';
        } else {
            document.getElementById('anchorlistcontainer')
                .innerHTML = html;
        }
        // edit mode show existing href in input
        elm = inst.selection.getNode();
        elm = inst.dom.getParent(elm, 'A');
        if (elm !== null && elm.nodeName === 'A') {
            action = 'update';
        }
        if (action === 'update') {
            var href = inst.dom.getAttrib(elm, 'href');
            // Setup form data
            if (href.indexOf('#') === 0) {
                href = href.replace('x-ck12-', '');
            }
            this.setFormValue('href', href);
        }
    },

    getAnchorList: function (id, target) {
        'use strict';
        anchorArray = [];
        var html = '';
        html = '<select  style="width:200px;" id="' + id + '" name="' + id + '" class="mceAnchorList"' + ' onchange="this.form.' + target +
            '.value=this.options[this.selectedIndex].value"' + '>' + '<option value="">---</option>' + this.getAnchorImages() + this.getAnchorTables() + this.getAnchorEmbedObjects() + '</select>';
        return html;
    },

    getAnchorImages: function () {
        'use strict';
        var id, i, n, nodes, len,
            ed = tinyMCEPopup.editor,
            img_html = '',
            count = 0;
        nodes = ed.dom.select('img');
        len = nodes.length;
        for (i = 0; i < len; i++) {
            n = nodes[i];
            // non inline image
            if (n.parentNode.nodeName !== 'SPAN' && n.className.indexOf('ck12-media-placeholder') === -1) {
                id = ed.dom.getAttrib(n, 'id');
                if (id && id.indexOf('x-ck12-') !== -1) {
                    id = id.replace('x-ck12-', '');
                    img_html += '<option value="#' + id + '"> Figure ' + (++count) + ' (' + id + ')</option>';
                    anchorArray.push('#' + id);
                } else {
                    id = new Date().getTime().toString();
                    id = 'x-ck12-' + Base64.encode(id);
                    ed.dom.setAttrib(n, 'id', id);
                    id = id.replace('x-ck12-', '');
                    img_html += '<option value="#' + id + '"> Figure ' + (++count) + ' (' + id + ')</option>';
                    anchorArray.push('#' + id);
                }
            }
        }

        return img_html;
    },

    getAnchorTables: function () {
        'use strict';
        var id, i, len, n, nodes,
            ed = tinyMCEPopup.editor,
            table_html = '',
            count = 0;
        nodes = ed.dom.select('table');
        for (i = 0, len = nodes.length; i < len; i++) {
            n = nodes[i];

            if (ed.dom.getAttrib(n, 'class').indexOf('x-ck12-element-box-placeholder') === -1) {
                id = ed.dom.getAttrib(n, 'id');
                if (id && id.indexOf('x-ck12-') !== -1) {
                    id = id.replace('x-ck12-', '');
                    table_html += '<option value="#' + id + '"> Table ' + (++count) + ' (' + id + ')</option>';
                    anchorArray.push('#' + id);
                } else {
                    id = new Date();
                    id = 'x-ck12-' + Base64.encode(id);
                    ed.dom.setAttrib(n, 'id', id);
                    id = id.replace('x-ck12-', '');
                    table_html += '<option value="#' + id + '"> Table ' + (++count) + ' (' + id + ')</option>';
                    anchorArray.push('#' + id);
                }
            }
        }

        return table_html;
    },

    getAnchorEmbedObjects: function () {
        'use strict';
        var id, i, len, n, nodes,
            ed = tinyMCEPopup.editor,
            object_html = '',
            count = 0;
        nodes = ed.dom.select('.ck12-media-placeholder');
        for (i = 0, len = nodes.length; i < len; i++) {
            n = nodes[i];
            id = ed.dom.getAttrib(n, 'data-ck12embed-iframe-id');
            if (id && id.indexOf('x-ck12-') !== -1) {
                id = id.replace('x-ck12-', '');
                object_html += '<option value="#' + id + '"> Object ' + (++count) + ' (' + id + ')</option>';
                anchorArray.push('#' + id);
            } else {
                id = new Date();
                id = 'x-ck12-' + Base64.encode(id);
                ed.dom.setAttrib(n, 'data-ck12embed-iframe-id', id);
                id = id.replace('x-ck12-', '');
                object_html += '<option value="#' + id + '"> Object ' + (++count) + ' (' + id + ')</option>';
                anchorArray.push('#' + id);
            }
        }

        return object_html;
    },

    update: function () {
        'use strict';
        var f = document.forms[0],
            ed = tinyMCEPopup.editor,
            i, e, b, href = f.href.value.replace(/ /g, '%20'),
            temp = href;
        if (href.indexOf('#') === 0) {
            href = href.replace('#', '');
            href = '#x-ck12-' + href;
        }
        tinyMCEPopup.editor.selection.moveToBookmark(tinyMCEPopup.editor.storeSelection);
        tinyMCEPopup.restoreSelection();
        e = ed.dom.getParent(ed.selection.getNode(), 'A');
        // Encoding ':' to validate URL.
        for (i = 0; i < temp.length; i++) {
            if (i > 8 && temp.charAt(i) === ':') {
                temp = temp.split('');
                temp.splice(i, 1, '%3A');
                temp = temp.join('');
            }
        }
        f.href.value = temp;
        // Remove element if there is no href
        if (!f.href.value) {
            if (e) {
                b = ed.selection.getBookmark();
                ed.dom.remove(e, 1);
                ed.selection.moveToBookmark(b);
                tinyMCEPopup.execCommand('mceEndUndoLevel');
                tinyMCEPopup.close();
                return;
            }
        } else {
            if (!this.validateUrl(f.href.value) && this.validateAnchors(f.href.value)) {
                tinyMCE.activeEditor.windowManager.alert(tinyMCEPopup.getLang('advanced_dlg.valid_link'));
                return;
            }
        }
        // Create new anchor elements
        if (!e) {
            ed.getDoc().execCommand('unlink', false, null);
            tinyMCEPopup.execCommand('mceInsertLink', false, '#mce_temp_url#', {
                skip_undo: 1
            });
            tinymce.each(ed.dom.select('a'), function (n) {
                if (ed.dom.getAttrib(n, 'href') === '#mce_temp_url#') {
                    e = n;
                    ed.dom.setAttribs(e, {
                        href: href,
                        title: f.linktitle.value,
                        target: f.target_list ? getSelectValue(f, 'target_list') : null,
                        'class': f.class_list ? getSelectValue(f, 'class_list') : null
                    });
                }
            });
        } else {
            ed.dom.setAttribs(e, {
                href: href,
                title: f.linktitle.value,
                target: f.target_list ? getSelectValue(f, 'target_list') : null,
                'class': f.class_list ? getSelectValue(f, 'class_list') : null
            });
        }
        // Don't move caret if selection was image
        if (e.childNodes.length !== 1 || e.firstChild.nodeName !== 'IMG') {
            ed.focus();
            ed.selection.select(e);
            ed.selection.collapse(0);
            tinyMCEPopup.storeSelection();
        }
        tinyMCEPopup.execCommand('mceEndUndoLevel');
        tinyMCEPopup.close();
    },

    checkPrefix: function (n) {
        'use strict';
        if (n.value && Validator.isEmail(n) && !/^\s*mailto:/i.test(n.value) && confirm(tinyMCEPopup.getLang('advanced_dlg.link_is_email'))) {
            n.value = 'mailto:' + n.value;
        }
        if (/^\s*([\w\.])*([\w])+\.([\w])+/i.test(n.value) && confirm(tinyMCEPopup.getLang('advanced_dlg.link_is_external'))) {
            n.value = 'http://' + tinymce.trim(n.value);
        }
    },

    setFormValue: function (name, value) {
        'use strict';
        document.forms[0].elements[name].value = value;
    },

    validateUrl: function (arg) {
        'use strict';
        // Bug 34914: changed the url validator
        var pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
        return pattern.test(arg);
    },

    validateAnchors: function (arg) {
        'use strict';
        var i, len = anchorArray.length;
        for (i = 0; i < len; i++) {
            if (anchorArray[i] === arg) {
                return false;
            }
        }
        return true;
    }
};

LinkDialog.preInit();
tinyMCEPopup.onInit.add(LinkDialog.init, LinkDialog);