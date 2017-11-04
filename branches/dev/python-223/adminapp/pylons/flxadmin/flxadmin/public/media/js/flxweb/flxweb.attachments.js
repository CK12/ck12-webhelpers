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
 * $id$
 */

(function($){
    
    var resource_row_template = null;
    
    function detatch(evt){
        var elm = $(this);
        var resource_row = $(this).parents().filter('.js_resource_row');
        var artifact_id = $(elm).data('artifact-id');
        var artifact_revision_id = $(elm).data('artifact-revision-id');
        var resource_id = $(elm).data('resource-id');
        var resource_revision_id = $(elm).data('resource-revision-id');
        var detach_url = $.flxweb.settings.webroot_url + '/ajax/resource/detach/';
        if (artifact_id.length != 0 || artifact_revision_id.length != 0) {  
            detach_url += artifact_id + '/' + artifact_revision_id + '/'; 
            detach_url += resource_id + '/' + resource_revision_id + '/';
        } else {
            //Remove attachments in artifact data 
            var data = {
            'resource_id' : resource_id,
            'resource_revision_id' : resource_revision_id
            }
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.remove_attachment', data);
            //If attached file is not associated with any artifact, Just remove it
            detach_url = $.flxweb.settings.webroot_url + '/ajax/resource/delete/';
            detach_url += resource_id + '/';
        }
        $.ajax({
            url: detach_url,
            success: function(){resource_row.hide(500, function(){$(this).remove();});
            }
        });
        
        return false;
    }
    
    function rowHoverIn(){
        var elm = $(this);
        var publicToggle = $(elm).find(".js_resource_public_toggle");
        if (publicToggle.size()){
            publicToggle.removeClass('hide');
        }
    }
    
    function rowHoverOut(){
        var elm = $(this);
        var publicToggle = $(elm).find(".js_resource_public_toggle");
        if (publicToggle.size()){
            publicToggle.addClass('hide');
        }
    }
    
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
            var row = $(resource_row_template);
            var row_id = "resource_row_" + Number(new Date());
            data.row_id = row_id;
            $(row).find('.js_resource_link').text(filename);
            $(row).attr('id', row_id);
            $('.js_resource_container').prepend($(row));
            data.submit();
        } else {
            var ext = filename.split('.').pop();
            $.flxweb.showDialog("Files with extension ."+ext+" are not supported as attachments.",{'title': "Invalid Extension"});
        }
    }
    
    function fileUploadSend(e, data){
        return false;
    }
    
    function fileUploadDone(e, data){
        var row_id = data.row_id;
        var row = $("#"+row_id);
        var resource = data.result;
        if (resource.status == "error"){
            var error_data = resource.data;
            var filename = data.files[0].name;
            var error_msg = "Failed to upload " + filename + "<br />" +resource.message;
            $.flxweb.showDialog(error_msg,{
                'title': "Error uploading file",
                'close': function(){
                    row.hide(500, function(){ $(this).remove(); });
                }
            });
        } else {
            var art_id='', art_rev_id='', res_id='', res_rev_id='';
            var resource_details_url = '';
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.success', {
                'resource': resource,
                'fileupload_data': data 
            });
            res_id = resource.id;
            res_rev_id = resource.resourceRevisionID;
            if ('associatedArtifactID' in resource && 'associatedArtifactRevisionID' in resource){
                art_id = resource.associatedArtifactID;
                art_rev_id = resource.associatedArtifactRevisionID;
            }
            resource_details_url = $.flxweb.settings.webroot_url;
            if (resource.realm){
                resource_details_url += resource.realm;
            }
            resource_details_url += '/resource/'+resource.type+'/'+resource.handle;
            
            $(row).find('.loading').remove();
            $(row).find('.actions').removeClass('hide');
            $(row).attr('data-resource-id',res_id);
            $(row).attr('data-resource-name',resource.name);
            
            $(row).find('.js_resource_link').attr('href',resource_details_url);
            
            var remove_btn = $(row).find('.actions .js_resource_remove');
            if ($(remove_btn).size()){
                $(remove_btn).attr('data-resource-id', res_id);
                $(remove_btn).attr('data-resource-revision-id', res_rev_id);
                $(remove_btn).attr('data-artifact-id', art_id);
                $(remove_btn).attr('data-artifact-revision-id', art_rev_id);
            } 
        }
            
    }
    
    function fileUploadProgress(e, data){
        var row_id = data.row_id;
        var row = $("#"+row_id);
        var progress = parseInt(data.loaded/data.total * 100, 10);
        if ($(row).size()){
            $(row).find('.loading .progressbar').css({'width': progress + '%'});
        }
        $.flxweb.events.triggerEvent(document, 'flxweb.attachments.progress', {
            'progress': progress,
            'fileupload_data': data
        });
    }
    
    function resourceUpdateSuccess(data){
        var resource = data;
        var resource_id = resource.id;
        var is_public = resource.isPublic;
        var resource_name = resource.name;
        var row = null;
        var row_toggle_link = null;
        $('.js_resource_row').each(function(){
            if ($(this).data('resource-id') == resource_id){
                if(is_public){
                    $(this).find('.js_publishstate_icon').addClass('hide');
                    $(this).find('.js_noimage').removeClass('hide');
                    row_toggle_link = $(this).find('.js_resource_public_toggle');
                    row_toggle_link.attr('data-ispublic', 'true');
                    row_toggle_link.data('ispublic','true');
                    row_toggle_link.text(row_toggle_link.data('txtmakeprivate'));
                    row_toggle_link.removeClass('js_resource_processing');
                } else {
                    $(this).find('.js_publishstate_icon').removeClass('hide');
                    $(this).find('.js_noimage').addClass('hide');
                    row_toggle_link = $(this).find('.js_resource_public_toggle');
                    row_toggle_link.attr('data-ispublic', 'false');
                    row_toggle_link.data('ispublic','false');
                    row_toggle_link.text(row_toggle_link.data('txtmakepublic'));
                    row_toggle_link.removeClass('js_resource_processing');
                }
                $(this).effect('pulsate');
                $.flxweb.notify("Successfully updated permissions for "+resource_name);
            }
        });
    }
    
    function resourceUpdateError(xhr, msg, textStatus){
        $.flxweb.showDialog("Failed to update permissions for the resource.");
        $('.js_resource_processing').removeClass('js_resource_processing');
    }
    
    function updateResource(resource_obj){
        var resource_update_url = $.flxweb.settings.webroot_url + 'ajax/resource/upload/';
        $.ajax({
            'url': resource_update_url,
            'type':'POST',
            'data': resource_obj,
            'success': resourceUpdateSuccess,
            'error': resourceUpdateError,
            'dataType':'json'
        });
    }
    
    function notifyAttachmentSuccess(e, data){
        var resource = data.resource;
        var resourceName = resource.name;
        $.flxweb.notify(resourceName + " was successfully uploaded.");
    }
    
    function toggleResourcePublic(){
        var resource_id = $(this).parents().filter('.js_resource_row').data('resource-id');
        var resource_name = $(this).parents().filter('.js_resource_row').data('resource-name');
        var is_public = '' + $(this).data('ispublic');
        is_public = is_public == '1' || is_public.toLowerCase() == 'true';
        var data = {
            'resourceid': resource_id,
            'resource_name' : resource_name,
            'isPublic': !is_public,
            'isAttachment': true
        };
        $(this).addClass('js_resource_processing');
        updateResource(data);
        return false;
    }
    
    function domready(){
        $("#resource_upload").fileupload({
            'dataType': 'json',
            'singleFileUploads': true,
            'add': fileUploadAdd,
            'done': fileUploadDone,
            'progress': fileUploadProgress
        });
        $(".js_resource_row").live('mouseover',rowHoverIn);
        $(".js_resource_row").live('mouseout',rowHoverOut);
        $(".js_resource_row .js_resource_remove").live('click',detatch);
        resource_row_template = $("#ck12_template_resource_row").html();
        $.flxweb.updateResource = updateResource;
        $(document).bind('flxweb.attachments.success', notifyAttachmentSuccess);
        $('.js_resource_public_toggle').live('click',toggleResourcePublic);
    }
    
    $(document).ready(domready);
})(jQuery);
