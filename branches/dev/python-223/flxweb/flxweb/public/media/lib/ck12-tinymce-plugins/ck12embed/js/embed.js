var _popup = tinyMCEPopup;
_popup.requireLangPack();

function getWin() {
    'use strict';

    return window.dialogArguments || opener || parent || top;
}

var $ = getWin().jQuery;

function validateCode(code) {
    'use strict';

    code = (code || '').trim();
    var valid = false;
    if (code) {
        valid = true;
    }
    return valid;
}

var loader = (function embeddedObjectLoader() {

    var src_embed_code = '',
        response_data = '',
        ck12 = this.getWin().$.flxweb.settings;

    function objectFetchSuccess(data) {
        if (data) {
            var event;
            if (data.status !== 'error') {
                event = $.Event('OBJECT_FETCH_SUCCESS');
                $.extend(event, {
                    'embed_data': data
                });
                response_data = data;
            } else {
                event = $.Event('OBJECT_FETCH_ERROR');
                $.extend(event, {
                    error_info: {
                        'data': data
                    }
                });
            }
            $(document).trigger(event);
        }
    }

    function objectFetchError(xhr, text_status) {
        var _error = $.Event('OBJECT_FETCH_ERROR');
        $.extend(_error, {
            error_info: {
                'data': xhr,
                'status': text_status
            }
        });
        $(document).trigger(_error);
    }

    function createObjectFromCode(embed_code) {
        if (embed_code) {
            if (embed_code === src_embed_code) {
                var _success = $.Event('OBJECT_FETCH_SUCCESS');
                $.extend(_success, {
                    'embed_data': response_data
                });
                $(document).trigger(_success);
            } else {
                src_embed_code = embed_code;
                $.ajax({
                    url: ck12.embedded_object_create_endpoint,
                    data: {
                        'embed_code': embed_code
                    },
                    success: objectFetchSuccess,
                    error: objectFetchError,
                    dataType: 'json'
                });
            }
        }
    }

    function getObjectById(id) {
        id = (id || '').trim();
        $.ajax({
            url: ck12.embedded_object_get_endpoint + id + '/',
            success: objectFetchSuccess,
            error: objectFetchError,
            dataType: 'json'
        });
    }

    return {
        'getObjectById': getObjectById,
        'createObjectFromCode': createObjectFromCode
    };

}());

function getIframeCode(data) {
    'use strict';

    return data.iframe;
}

function renderPreview(event) {
    'use strict';

    var preview_code, data = event.embed_data;
    preview_code = getIframeCode(data);
    if (!preview_code) {
        preview_code = data.code;
    }
    if (data.code && data.code !== ($(document).find('#embed_input').val() || '').trim()) {
        $(document).find('#embed_input').val(data.code);
    }
    $(document).find('#embed_preview').html(preview_code);
}

function showPreview(embed_code) {
    'use strict';

    $(document).find('#embed_preview').html(embed_code);
}

function showError(msg) {
    'use strict';

    showPreview('<div id="embedcode_error">' + msg + '</div>');
}

function insertObject(event) {
    'use strict';

    var iframe_code, img_node, img_attr, i, _attr, n, img_elm, dom, iframe_id,
        data = event.embed_data,
        ed = _popup.editor;
    // Insert the contents from the input into the document
    $(document).unbind('OBJECT_FETCH_SUCCESS', insertObject);
    iframe_code = getIframeCode(data);
    img_node = ed.plugins.ck12embed.htmlstrToImg(iframe_code);
    if (img_node) {
        img_attr = {};

        for (i = 0; i < img_node.attributes.length; i++) {
            _attr = img_node.attributes[i];
            img_attr[_attr.name] = _attr.value;
        }
        n = ed.selection.getNode();
        dom = ed.dom;
        iframe_id = dom.getAttrib(n, 'data-ck12embed-iframe-id');

        if (!iframe_id || iframe_id === '' || iframe_id.indexOf('x-ck12-') === -1) {
            iframe_id = new Date().toString();
            iframe_id = 'x-ck12-' + Base64.encode(iframe_id);
        }
        img_attr['data-ck12embed-iframe-id'] = iframe_id;

        img_elm = ed.dom.create('img', img_attr);
        ed.selection.setNode(img_elm);
    }
    ed.execCommand('mceAutoResize');
    _popup.close();
}

function renderError(event) {
    'use strict';

    var error_data = event.error_info.data,
        msg = 'Could not get object details.';
    if (error_data.message) {
        msg += '<br />Reason: ' + error_data.message;
    } else {
        msg += '<br />Reason: unknown error';
    }
    showError(msg);
}

var EmbedDialog = {
    init: function ( /*editor*/ ) {
        'use strict';

        var id, ed = _popup.editor,
            dom = ed.dom,
            n = ed.selection.getNode();

        $(document).find('#embed_input').change(function () {
            var embed_code = $(this).val();
            embed_code = (embed_code || '').trim();
            if (validateCode(embed_code)) {
                loader.createObjectFromCode(embed_code);
            }
        });
        $(document).find('#embed_input').keydown(function () {
            var error_elm = $(document).find('#embed_preview #embedcode_error');
            if ($(error_elm).size() > 0) {
                $(error_elm).remove();
            }
        });
        $(document).bind('OBJECT_FETCH_SUCCESS', renderPreview);
        $(document).bind('OBJECT_FETCH_ERROR', renderError);

        if (n && n.nodeName === 'IMG') {
            if (n.className.indexOf('ck12-media-placeholder') !== -1) {
                id = dom.getAttrib(n, 'data-ck12embed-iframe-name');
                if (id) {
                    loader.getObjectById(id);
                }
            }
        }
    },
    preview: function () {
        'use strict';

        var embed_code = $('#embed_input', document).val();
        embed_code = (embed_code || '').trim();
        if (validateCode(embed_code)) {
            loader.createObjectFromCode(embed_code);
        } else {
            showError('Embed code cannot be blank');
        }
    },
    insert: function () {
        'use strict';

        //unbind any similar binding and establish new one.
        $(document).unbind('OBJECT_FETCH_SUCCESS', insertObject);
        $(document).bind('OBJECT_FETCH_SUCCESS', insertObject);
        var embed_code = $('#embed_input', document).val();
        embed_code = (embed_code || '').trim();
        if (validateCode(embed_code)) {
            loader.createObjectFromCode(embed_code);
        } else {
            showError('Embed code cannot be blank');
        }
    }
};

_popup.onInit.add(EmbedDialog.init, EmbedDialog);