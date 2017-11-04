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
define('flxweb.xdtimport',
['jquery','jquery-ui','flxweb.global','flxweb.models.artifact','common/utils/utils','jquery.iframe-transport','jquery.fileupload'],
function($,UI,Global,Artifact, Util) {
    
    var xdt_dlg = null;
    var xdt_cnt = null;
    var fileupload = null;
    var txt_title = null;
    var xdt_data = null;
    var old_filename = null;
    var old_txt_title = null;

    var task_id = null;
    var artifact=null;
    
    /**
     * Import related
     */

    function artifactFetchSuccess(artifact, response) {
        artifact.set({'dirty':false}, {'silent':true});
        $.flxweb.events.triggerEvent(document, 'flxweb.xdtimport.success', {
            'artifact' : artifact,
            'doc_name': xdt_data.files[0].name
        });
    }

    function importSuccess(json_status) {
        var userdata = json_status.userdata;
        if(userdata) {
            artifact = new Artifact({
                'artifactType' : userdata.artifactType,
                'id' : userdata.artifactID
            });
            artifact.fetch({
                'success' : artifactFetchSuccess
            });
        }
    }

    function importError(error_info) {
        var result = error_info.result;
        var duplicate_re =  /(.*?)\[(.*?)\]\s+from\[(.*?)\]\s+exists already/g;
        var is_duplicate = false;
        if (result){
            var re_info = duplicate_re.exec(result);
            if (re_info){
                is_duplicate = true;
                var artifact_type = re_info[1];
                if (artifact_type.toLowerCase() == "book" || artifact_type.toLowerCase() == 'flexbook'){
                    artifact_type = 'FlexBook';
                } else {
                    artifact_type = 'concept';
                }
                var artifact_title = re_info[2];
                $(xdt_dlg).find('.js_dlg_content').removeClass('hide');
                $(xdt_dlg).find('.js_dialog_loading').addClass('hide');
                $.flxweb.showDialog(
                    $.flxweb.gettext("The <%= artifact_type %> with title <strong><%= _.escape(artifact_title) %> already exists</strong> in your library. Please use a different title.",{
                        'artifact_type' : artifact_type,
                        'artifact_title' : artifact_title
                    }),{
                'title' : $.flxweb.gettext("Invalid Title"),
                'buttons' : {
                    'OK': function(){
                        $(xdt_dlg).find('#txt_xdt_title').focus().select();
                        $(this).dialog('close');
                    }
                }
                });
            }
        }
        if (!is_duplicate){
            xdt_dlg.close();
            $.flxweb.showDialog("Word document import failed with errors.");
        }
    }

    function importStartSuccess(e, data) {
        task_id = data.result.taskID;
        $.flxweb.TaskProcessor({
            'task_id' : task_id
        }).then(importSuccess, importError);
    }

    function importStartError(e, data) {
        xdt_dlg.close();
        $.flxweb.showDialog("Could not import word document.\n Error:"+data.errorThrown);        
    }
    
    function validate(){
        var _valid = true;
        if (! $.trim($("#txt_xdt_title").val()) ){
            $('.js_xdt_titlecontainer').find('.error').removeClass('hide');
            _valid = false;
        }
        
        if (! $("#file_xdt_upload").val() ){
            $('.js_xdt_filecontainer').find('.error').removeClass('hide');
            _valid = false;
        }
        if (_valid){
        	_valid = Util.validateResourceTitle($("#txt_xdt_title").val(), 'concept', $('#txt_xdt_title'));
        }
        return _valid;
    }

    function startXDTImport() {
        
        if (!validate()){
            return false;
        }
        
        if (xdt_data){
            $(xdt_dlg).find('.js_dlg_content').addClass('hide');
            $(xdt_dlg).find('.js_dialog_loading').removeClass('hide');
            $(xdt_dlg).find('.js_dialog_loading .msg').html("Importing "+ xdt_data.files[0].name);
            if(xdt_data){
                xdt_data.submit();
            }
        }
        return false;
    }
    
    /**
     * Initializations and event handling
     */

    function onDialogClose() {
        //reset variables
        artifact = null;
        task_id = null;
        old_filename = null;
        old_txt_title = null;
        //Bug 9004 redirect the user to "Edit" tab on add Chapter.
        $('.js_editortabs').tabs( "select" , '#edit_content' );
    }
    
    function fileAdd(e, data){
        var filename = data.files[0].name;
        if ( filename.toLowerCase().substr(filename.length -5) == '.docx' ){
            $('.js_xdt_filecontainer').find('.error').addClass('hide');
            $('.js_xdt_titlecontainer').find('.error').addClass('hide');
            if ( ! $.trim( txt_title.val() ) ){
                txt_title.val(filename);
            }
            var current_txt_title = $.trim(txt_title.val());
            if((old_txt_title == current_txt_title) && (old_filename == old_txt_title)) {
                txt_title.val(filename);
            }
            current_txt_title = $.trim(txt_title.val());
            old_txt_title = current_txt_title;
            old_filename = filename;
            xdt_data = data;
        } else {
            $('.js_xdt_filecontainer').find('.error').removeClass('hide');
        }
    }
    
    function titleCheck(){
        if (! $.trim($("#txt_xdt_title").val()) ){
            $('.js_xdt_titlecontainer').find('.error').removeClass('hide');
        } else {
            $('.js_xdt_titlecontainer').find('.error').addClass('hide');
        }
    }
    
    

    function onDialogOpen() {
        
        $("#js_addfromword_confirm").click(startXDTImport);
        $("#js_xdtupload_form").submit(startXDTImport);
        $("#txt_xdt_title").change(titleCheck);
        xdt_cnt = $(xdt_dlg).find(".xdtimport_container");
        txt_title = $(xdt_dlg).find('#txt_xdt_title');
        
        fileupload = $(".xdtimport_container").fileupload({
            'dataType' : 'json',
            'acceptFileTypes' : /(\.|\/)(docx?)$/i,
            'replaceFileInput': false,
            'add': fileAdd,
            'done': importStartSuccess,
            'fail': importStartError
        });
    }

    function domReady() {
        xdt_dlg = $.flxweb.createDialog('#js_dialog_uploadworddoc');
        xdt_dlg.bind('flxweb.dialog.open', onDialogOpen);
        xdt_dlg.bind('flxweb.dialog.close', onDialogClose);
        $.extend(true, $.flxweb, {
            'xdtimport' : xdt_dlg
        });
    }
    $(document).ready(domReady);
});
