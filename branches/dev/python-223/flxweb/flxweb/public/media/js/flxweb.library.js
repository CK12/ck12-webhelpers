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
define('flxweb.library',
['jquery','jquery-ui','flxweb.library.common','flxweb.coursegen','flxweb.models.artifact','flxweb.global',
'jquery.iframe-transport','jquery.fileupload','flxweb.edit.resource','flxweb.settings'],
function($,UI,LibraryModule,CoursegenModule,Artifact) {
    
    var fileupload_dialog = null;
    
    function validateFileType(filename){
        var filetype_re_str = "(doc|dot|docx|dotx,|odt|ott|txt|" +
            "xlsx|xltx|xls|xlt|ods|ots|"+
            "ppt|pps|pot|pptx|potx|ppsx|odp|otp|swf|"+
            "pdf|zip|tar|tar.gz|"+
            "epub|mobi|"+
            "jpg|jpeg|png|bmp|"+
            "cdf|flv|"+
            "key|keynote|pages|numbers)$";
        var filetype_re = new RegExp(filetype_re_str,"i");
        return filetype_re.test(filename);
    }
    
    function validateFileSize(uploadfile){
        if (uploadfile.size > parseInt($.flxweb.settings.attachment_max_upload_size)){
            return false;
        }
        return true;
    }
    
    function fileUploadAdd(e, data){
        var uploadfile = data.files[0];
        var filename = uploadfile.name;
        closeCreateDropdown();
        if (validateFileType(filename)){
            if (validateFileSize(uploadfile)){
                $.flxweb.events.triggerEvent(document,'flxweb.attachments.add',{
                    'fileupload_data' : data
                });
            }else{
                $.flxweb.showDialog("Failed to upload \""+ filename +"\" <br > Uploaded file is too large. Maximum size allowed is " +
                    parseInt($.flxweb.settings.attachment_max_upload_size)/(1024*1024) + " MB",{'title': "Error uploading file"});
                $.flxweb.events.triggerEvent(document, 'flxweb.attachments.error');
            }
        } else {
            var ext = filename.split('.').pop();
            $.flxweb.showDialog("Files with extension ."+ext+" are not supported as attachments.",{'title': "Invalid Extension"});
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.error');
        }
    }
    
    function fileUploadDone(e, data){
        var resource = data.result;
        if (resource.status === "error"){
            var uploadfile = data.files[0];
            var filename = uploadfile.name;
            var error_msg = 'Failed to upload "' + filename + '"<br />' +resource.message;
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
        $(fileupload_dialog).find('.js_progress_status').width(data.progress + '%');
    }
    
    function onAttachmentSuccess(e, data){
        var uploadfile = data.fileupload_data.files[0];
        var filename = (uploadfile.filename)?uploadfile.fileName:uploadfile.name;
        fileupload_dialog.close();
        $.flxweb.showDialog( $.flxweb.gettext('"<strong><%= filename %></strong>" was uploaded successfully.', {'filename': filename}),{
            'buttons': [{ 'text': $.flxweb.gettext("OK"), 'click': function(){
                $(this).dialog('close');
                window.location = $.flxweb.settings.webroot_url + 'my/content/files/resources/All';
            }}]
        });
    }
    
    function addArtifact(artifact,doc_name){
        var titles = Artifact.htmlEscapArtifactTitle(artifact.get('title'));
        var doc_type;
        if ( Artifact.isBookType( artifact.get('artifactType') ) ) {
            doc_type = 'Collection';
        } else {
            doc_type = 'Document';
        }
        var disp_msg = doc_type + " was imported successfully and saved with the title <strong>"+titles.display_title+"</strong> in your library.";
        if(doc_name !== '' && doc_name !== null && doc_name !== 'null'){
            disp_msg = "<strong>"+doc_name+"</strong> was imported successfully and saved with the title <strong>"+titles.display_title+"</strong> in your library.";
        }
        $.flxweb.showDialog( $.flxweb.gettext(disp_msg),{
            'buttons': [{ 'text': $.flxweb.gettext("OK"), 'click': function(){
                $(this).dialog('close');
                if ( Artifact.isBookType( artifact.get('artifactType') ) ){
                    window.location = $.flxweb.settings.webroot_url + 'my/content/content/book/All';
                } else {
                    var type = artifact.get('artifactType');
                    if(type === 'lesson' || type === 'concept') {
                        type = 'concept';
                    }else {
                        type = artifact.get('artifactType') ;
                    }
                            
                    window.location = $.flxweb.settings.webroot_url + 'my/content/content/'+type+'/All';
                }
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
        closeCreateDropdown();
        return false;
    }

    function openXDTimporter() {
        $.flxweb.xdtimport.open();
        closeCreateDropdown();
        return false;
    }

    function closeCreateDropdown() {
        if($("#library_create_menu").get(0) !== null && $("#library_create_menu").get(0) !== undefined) {
            $("#library_create_menu").get(0).hideMenu(); //hide menu
        }
    }

    function gdtImportSuccess(evt, data) {
        var artifact = data.artifact;
        var gdt_doc_name = data.doc_name;
        $.flxweb.gdtimport.close();
        addArtifact(artifact,gdt_doc_name);
    }

    function xdtImportSuccess(evt, data) {
        var artifact = data.artifact;
        var xdt_doc_name = data.doc_name;
        $.flxweb.xdtimport.close();
        addArtifact(artifact,xdt_doc_name);
    }
    
    function domReady() {
        var items_data_container = $('#items_json_data');
        if ( items_data_container.size() && items_data_container.text() ){
            window.items_json = JSON.parse(items_data_container.text());
        }
        window.libraryAppView = new LibraryModule.LibraryView({el:$('#contentwrap')});
        window.coursegenAppView = new CoursegenModule.CoursegenView({el:$('#dialog_coursegen'),
                                                     target:$('#curriculum_book')});
        $("#library_resource_upload").fileupload({
            'dataType': 'json',
            'singleFileUploads': true,
            'add': fileUploadAdd,
            'done': fileUploadDone,
            'progress': fileUploadProgress
        });
        $("#library_resource_upload .uploadfile_input").hover(
            function(){$("#library_resource_upload .js_upload_btn").addClass('hover');},
            function(){$("#library_resource_upload .js_upload_btn").removeClass('hover');}
        );
        $(document).bind('flxweb.attachments.add', onAttachmentAdd);
        $(document).bind('flxweb.attachments.progress', onAttachmentProgress);
        $(document).bind('flxweb.attachments.success', onAttachmentSuccess);
        $(document).bind('flxweb.attachments.error', onAttachmentError);
        $(document).bind('flxweb.library.closeCreateDropdown', closeCreateDropdown);
        
        $('#library_resource_upload').bind('click', function(e){ 
            e.stopPropagation();
            //Bug 11143, if client is safari, do not close drop down
            if (!$.browser.webkit){
                closeCreateDropdown();
            }
        });
        $("#btn_gdtimport").click(openGDTimporter);
        $("#btn_xdtimport").click(openXDTimporter);
        $(document).bind('flxweb.gdtimport.success', gdtImportSuccess);
        $(document).bind('flxweb.xdtimport.success', xdtImportSuccess);
        
        window.editResourceDialog.bind('flxweb.resource.update.onsuccess',window.editResourceDialog.updateLibraryResourceRow);
        $("#mylib_create_new").bind('click', function(){
            $('#labelChooser').hide();
        });
        //sort options
        $('#sort_option').on('change',function(){
            $.flxweb.showLoading();
            $('#sort_form').submit();
        });
    }

    $(document).ready(domReady);
});
