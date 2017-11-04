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
    
    var xdt_dlg = null;
    var xdt_cnt = null;
    var fileupload = null;
    var txt_title = null;
    var xdt_data = null;
    
    var task_id = null;
    var artifact=null;
    
    /**
     * Import related
     */

    function artifactFetchSuccess(artifact, response) {
        artifact.set({'dirty':false}, {'silent':true});
        $.flxweb.events.triggerEvent(document, 'flxweb.xdtimport.success', {
            'artifact' : artifact
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
        xdt_dlg.close();
        $.flxweb.showDialog("Word document import failed with errors.");
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
    }
    
    function fileAdd(e, data){
        var filename = data.files[0].name;
        if ( filename.toLowerCase().substr(filename.length -5) == '.docx' ){
            $('.js_xdt_filecontainer').find('.error').addClass('hide');
            $('.js_xdt_titlecontainer').find('.error').addClass('hide');
            if ( ! $.trim( txt_title.val() ) ){
                txt_title.val(filename);
            }
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
})(jQuery);
