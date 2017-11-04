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
 * This file originally written by Ravi Gidwani 
 *
 * $Id$
 */

(function($) {
    
    var fileupload_dialog = null;
    
    function validateFileType(filename){
        var filetype_re_str = "(.doc|.dot|.docx|.dotx,.odt|.ott|.txt|" +
            ".xlsx|.xltx|.xls|.xlt|.ods|.ots|"+
            ".ppt|.pps|.pot|pptx|potx|.ppsx|.odp|.otp|.swf|"+
            ".pdf|.zip|.tar|.tar.gz|"+
            ".jpg|.jpeg|.png|.bmp|"+
            ".key|.keynote|.pages|.numbers)$";
        var filetype_re = new RegExp(filetype_re_str,"i");
        return filetype_re.test(filename);
    }
    
    function fileUploadAdd(e, data){
        var uploadinfo = data;
        var uploadfile = data.files[0];
        var filename = uploadfile.name;
        if (validateFileType(filename)){
            $.flxweb.events.triggerEvent(document,'flxweb.attachments.add',{
                'fileupload_data' : data
            });
        } else {
            var ext = filename.split('.').pop();
            $.flxweb.showDialog("Files with extension ."+ext+" are not supported as attachments.",{'title': "Invalid Extension"});
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.error');
        }
        $("#library_create_menu").get(0).hideMenu(); //hide menu
    }
    
    function fileUploadDone(e, data){
        var resource = data.result;
        if (resource.status == "error"){
            var error_data = resource.data;
            var uploadfile = data.files[0]
            var filename = uploadfile.name;
            var error_msg = "Failed to upload " + filename + "<br />" +resource.message;
            $.flxweb.showDialog(error_msg,{
                'title': "Error uploading file"
            });
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.error');
        } else {
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.success', {
                'resource': resource,
                'fileupload_data': data 
            });
        }
    }
    
    function fileUploadProgress(e, data){
        var progress = parseInt(data.loaded/data.total * 100, 10);
        $.flxweb.events.triggerEvent(document, 'flxweb.attachments.progress', {
            'progress': progress,
            'fileupload_data': data
        });
    }
    
    function onAttachmentAdd(e, data){
        var uploadfile = data.fileupload_data.files[0];
        var filename = (uploadfile.filename)?uploadfile.fileName:uploadfile.name;
        fileupload_dialog = $.flxweb.createDialog("#dialog_fileupload");
        $(fileupload_dialog).find('.js_upload_filename').text(filename);
        fileupload_dialog.open();
        data.fileupload_data.submit(); //submit request
    }
    
    function onAttachmentProgress(e, data){
        var progress = data.progress;
        $(fileupload_dialog).find('.js_progress_status').width(data.progress + '%');
    }
    
    function onAttachmentSuccess(e, data){
        var uploadfile = data.fileupload_data.files[0];
        var filename = (uploadfile.filename)?uploadfile.fileName:uploadfile.name;
        fileupload_dialog.close();
        $.flxweb.showDialog( $.flxweb.gettext("<%= filename %> was uploaded successfully.", {'filename': filename}),{
            'buttons': [{ 'text': $.flxweb.gettext("Ok"), 'click': function(){
                $(this).dialog('close');
                window.location = $.flxweb.settings.webroot_url + 'dashboard/my/files/resources/All';
            }}]
        });
    }
    
    function addArtifact(artifact){
        var title = artifact.get('title');
        $.flxweb.showDialog( $.flxweb.gettext("<%= title %> was imported successfully.", {'title': title}),{
            'buttons': [{ 'text': $.flxweb.gettext("Ok"), 'click': function(){
                $(this).dialog('close');
                window.location = $.flxweb.settings.webroot_url + 'dashboard/my/content/concept/All';
            }}]
        });
    }
    
    function onAttachmentError(){
        if (fileupload_dialog){
            fileupload_dialog.close();
        }
    }
    
    function openGDTimporter() {
        $.flxweb.gdtimport.open();
        return false;
    }

    function openXDTimporter() {
        $.flxweb.xdtimport.open();
        return false;
    }

    function gdtImportSuccess(evt, data) {
        var artifact = data.artifact;
        $.flxweb.gdtimport.close();
        addArtifact(artifact);
    }

    function xdtImportSuccess(evt, data) {
        var artifact = data.artifact;
        $.flxweb.xdtimport.close();
        addArtifact(artifact);
    }
    
    
    function domReady() {
        window.libraryAppView = new LibraryView({el:$('#contentwrap')});
        window.coursegenAppView = new CoursegenView({el:$('#dialog_coursegen'),
                                                     target:$('#curriculum_book')});
        $("#resource_upload").fileupload({
            'dataType': 'json',
            'singleFileUploads': true,
            'add': fileUploadAdd,
            'done': fileUploadDone,
            'progress': fileUploadProgress
        });
        $("#resource_upload .uploadfile_input").hover(
            function(){$("#resource_upload .js_upload_btn").addClass('hover');},
            function(){$("#resource_upload .js_upload_btn").removeClass('hover');}
        );
        $(document).bind('flxweb.attachments.add', onAttachmentAdd);
        $(document).bind('flxweb.attachments.progress', onAttachmentProgress);
        $(document).bind('flxweb.attachments.success', onAttachmentSuccess);
        $(document).bind('flxweb.attachments.error', onAttachmentError);
        $('#resource_upload').bind('click', function(e){ 
            e.stopPropagation();
        });
        $("#btn_gdtimport").click(openGDTimporter);
        $("#btn_xdtimport").click(openXDTimporter);
        $(document).bind('flxweb.gdtimport.success', gdtImportSuccess);
        $(document).bind('flxweb.xdtimport.success', xdtImportSuccess);
    }

    $(document).ready(domReady);
})(jQuery);
