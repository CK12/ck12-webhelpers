// 'use strict';
/* global Base64:false */

var EmbedDialog = (function () {
    'use strict';
    var _popup = top.tinymce.activeEditor.windowManager.windows[0];

    function getWin() {
        return window.dialogArguments || opener || parent || top;
    }

    var $ = getWin().jQuery;

    function validateCode(code) {
        code = $.trim(code);
        var valid = false;
        if(code) {
            valid = true;
        }
        return valid;
    }
    function b64EncodeUnicode(str) {
       return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
           return String.fromCharCode('0x' + p1);
       }));
    }
    var loader = (function embeddedObjectLoader() {
        var src_embed_code = '';
        var response_data = '';
        var ck12 = getWin().$.flxweb.settings;
        function objectFetchSuccess(data) {
            if(data) {
                if(data.status !== 'error') {
                    var _success = $.Event('OBJECT_FETCH_SUCCESS');
                    $.extend(_success, {
                        'embed_data' : data
                    });
                    response_data = data;
                    $(document).trigger(_success);
                } else {
                    var _error = $.Event('OBJECT_FETCH_ERROR');
                    $.extend(_error, {
                        error_info : {
                            'data' : data
                        }
                    });
                    $(document).trigger(_error);
                }
            }
        }

        function objectFetchError(xhr, text_status) {
            var _error = $.Event('OBJECT_FETCH_ERROR'),
                _xhr = xhr || '',
                _text_status  = text_status || '';

            $.extend(_error, {
                error_info : {
                    'data'   : _xhr,
                    'status' : _text_status
                }
            });
            $(document).trigger(_error);
        }

        function createObjectFromCode(embed_code) {
            if(embed_code) {
                if(embed_code == src_embed_code) {
                    var _success = $.Event('OBJECT_FETCH_SUCCESS');
                    $.extend(_success, {
                        'embed_data' : response_data
                    });
                    $(document).trigger(_success);
                } else {
                    src_embed_code = embed_code;
                    $.ajax({
                        url : ck12.embedded_object_create_endpoint,
                        data : {
                            'embed_code' : b64EncodeUnicode(embed_code)
                        },
                        success : objectFetchSuccess,
                        error : objectFetchError,
                        dataType : 'json'
                    });
                }
            }
        }

        function getObjectById(id) {
            id = $.trim(id);
            $.ajax({
                url : ck12.embedded_object_get_endpoint + id + '/',
                success : objectFetchSuccess,
                error : objectFetchError,
                dataType : 'json'
            });
        }

        return {
            'getObjectById' : getObjectById,
            'createObjectFromCode' : createObjectFromCode
        };

    })();

    function getIframeCode(data) {
        var iframe_code = null;
        iframe_code = data.iframe;
        return iframe_code;
    }

    function renderPreview(event) {
        var data = event.embed_data;
        var preview_code = getIframeCode(data);
        if (!preview_code){
            preview_code = data.code;
        }
        if (data.code && data.code != $.trim( $(document).find('#embed_input').val() ) ){
            $(document).find('#embed_input').val(data.code);
        }
        $(document).find('#embed_preview').html(preview_code);
    }

    function showPreview(embed_code) {
        $(document).find('#embed_preview').html(embed_code);
    }

    function showError(msg) {
        showPreview('<div id="embedcode_error">'+ msg +'</div>');
    }

    function insertObject(event) {
        var data = event.embed_data;
        var ed = top.tinymce.activeEditor;
        // Insert the contents from the input into the document
        $(document).unbind('OBJECT_FETCH_SUCCESS', insertObject);
        var iframe_code = getIframeCode(data);
        var img_node =  ed.plugins.ck12embed.htmlstrToImg(iframe_code);
        var img_attr = {};

        for (var i = 0; i < img_node.attributes.length; i++){
            var _attr = img_node.attributes[i];
            img_attr[_attr.name] = _attr.value;
        }
        var n = ed.selection.getNode(),
        dom = ed.dom,
        iframe_id = dom.getAttrib(n, 'data-ck12embed-iframe-id');

        if (!iframe_id || iframe_id === '' || iframe_id.indexOf('x-ck12-') === -1) {
            iframe_id = '' + +new Date();
            iframe_id = 'x-ck12-' + Base64.encode(iframe_id);
        }
        img_attr['data-ck12embed-iframe-id'] = iframe_id;

        var img_elm = ed.dom.create('img', img_attr);
        ed.selection.setNode( img_elm );
        ed.execCommand('mceAutoResize');
        _popup ? _popup.close() : top.tinymce.activeEditor.windowManager.windows[0].close();
    }

    function renderError(event){
        var error_data = event.error_info.data;
        var msg = 'Could not get object details.';
        if (error_data.message){
            msg += '<br />Reason: ' + error_data.message;
        } else {
            msg += '<br />Reason: unknown error';
        }
        showError(msg);
    }

    return {
        init : function(editor) {
            var ed = editor,
                dom = ed.dom,
                n = ed.selection.getNode();

            $(document).find('#embed_input').change(function() {
                var embed_code = $(this).val();
                embed_code = $.trim(embed_code);
                if(validateCode(embed_code)) {
                    loader.createObjectFromCode(embed_code);
                }
            });
            $(document).find('#embed_input').keydown(function() {
                var error_elm = $(document).find('#embed_preview #embedcode_error');
                if ( $(error_elm).size() > 0 ){
                    $(error_elm).remove();
                }
            });

            $(document).bind('OBJECT_FETCH_SUCCESS', renderPreview);
            $(document).bind('OBJECT_FETCH_ERROR', renderError);

            if (n && n.nodeName === 'IMG'){
                if (n.className.indexOf('ck12-media-placeholder') !== -1){
                    var id = dom.getAttrib(n, 'data-ck12embed-iframe-name');
                    if (id){
                        loader.getObjectById(id);
                    }
                }
            }
        },
        preview : function() {
            var embed_code = $('#embed_input', document).val();
            embed_code = $.trim(embed_code);
            if(validateCode(embed_code)) {
                loader.createObjectFromCode(embed_code);
            } else {
                showError('Embed code cannot be blank');
            }
        },
        insert : function() {
            //unbind any similar binding and establish new one.
            $(document).unbind('OBJECT_FETCH_SUCCESS', insertObject);
            $(document).bind('OBJECT_FETCH_SUCCESS', insertObject);
            var embed_code = $('#embed_input', document).val();
            embed_code = $.trim(embed_code);
            if(validateCode(embed_code)) {
                loader.createObjectFromCode(embed_code);
            } else {
                showError('Embed code cannot be blank');
            }
        }
    };
})();


EmbedDialog.init(top.tinymce.activeEditor);
