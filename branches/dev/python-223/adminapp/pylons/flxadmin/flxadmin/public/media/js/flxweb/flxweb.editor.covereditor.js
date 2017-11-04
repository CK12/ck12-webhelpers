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
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */

(function($) {

    function CustomCoverDialog() {
        var cover_dlg = null;
        var cover_form = null;
        var fileupload = null;
        var imgpreview = null;
        var loading = null;
        var custom_cover_url = null;
        var custom_cover_revision = null;

        function applyChanges() {
            if ( !custom_cover_url || !custom_cover_revision ){
                 return false;
            }             

            var data = {
                'cover_url' : custom_cover_url,
                'thumb_url' : custom_cover_url.replace(new RegExp('show/(default/)?'), 'show/THUMB_LARGE/'),
                'cover_revision' : custom_cover_revision
            };
            $.flxweb.events.triggerEvent(document, 'flxweb.editor.covereditor.coverchange', data);
        }

        function customCoverSuccess(e, data) {
            loading.addClass("hide");
            var coverinfo = data.result.custom_cover_info;
            custom_cover_url = coverinfo.customCoverImageUri;
            custom_cover_revision = coverinfo.resourceRevision;
            imgpreview.attr('src', custom_cover_url.replace(new RegExp('show/(default/)?'), 'show/THUMB_LARGE/'));
        }

        function fileAdd(e, data) {
            loading.removeClass('hide');
            data.submit();
        }

        function onDialogOpen() {
            imgpreview = $(cover_dlg).find('#cover_preview');
            cover_form = $(cover_dlg).find('#frm_customcover');
            loading = $(cover_dlg).find(".js_loading");
            fileupload = cover_form.fileupload({
                'dataType' : 'json',
                'add' : fileAdd,
                'done' : customCoverSuccess
            });
            $("#btn_coveredit_apply").click(applyChanges);
        }

        function init() {
            cover_dlg = $.flxweb.createDialog($('#js_dialog_customcover'));
            cover_dlg.bind('flxweb.dialog.open', onDialogOpen);
            return cover_dlg;
        }

        return init();
    }

    function domReady() {
        $.extend(true, $.flxweb, {
            'editor' : {
                'CustomCoverDialog' : CustomCoverDialog()
            }
        });
    }


    $(document).ready(domReady);

})(jQuery);
